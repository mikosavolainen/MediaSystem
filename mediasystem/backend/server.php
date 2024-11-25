<?php
// Allow Cross-Origin Resource Sharing (CORS)
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With"); 

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'vendor/autoload.php';
use \Firebase\JWT\JWT;
use \Firebase\JWT\KEY;

use MongoDB\Client as MongoClient;

$serverName = "37.136.11.1";
$userName = "root";
$password = "1234592";
$databaseName = "mediaserver";
$port = 3308;

$jwt_secret = 'Heh meidän salainen avain :O. ei oo ku meiän! ・:，。★＼(*v*)♪Merry Xmas♪(*v*)/★，。・:・゜ :DD XD XRP ┐( ͡◉ ͜ʖ ͡◉)┌ QSO QRZ ( ͡~ ͜ʖ ͡° ) QRO ( ˘▽˘)っ♨ QRP DLR JKFJ °₊·ˈ∗♡( ˃̶᷇ ‧̫ ˂̶᷆ )♡∗ˈ‧₊°';


$conn = mysqli_connect($serverName, $userName, $password, $databaseName, $port);
if (!$conn) {
    die(json_encode(["status" => "fail", "message" => "MySQL connection failed."]));
}

try {
    $mongoClient = new MongoClient("mongodb://Kissa:KissaKala2146@37.136.11.1:27018/");
    $mongoDatabase = $mongoClient->mediaserver;
    $mongoCollection = $mongoDatabase->react_php;
} catch (Exception $e) {
    die(json_encode(["status" => "fail", "message" => "MongoDB connection failed: " . $e->getMessage()]));  
}

if (!isset($_GET['action'])) {
    echo json_encode(["status" => "fail", "message" => "No action specified."]);
    exit;
}

$action = $_GET['action'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'register') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(["status" => "fail", "message" => "Username or password is missing."]);
        exit;
    }

    $query = "INSERT INTO users (username, password) VALUES ('$username', SHA2('$password', 256))";
    if (mysqli_query($conn, $query)) {
        echo json_encode(["status" => "success", "message" => "User registered successfully."]);
    } else {
        echo json_encode(["status" => "fail", "message" => "User registration failed: " . mysqli_error($conn)]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(["status" => "fail", "message" => "Username or password is missing."]);
        exit;
    }

    $query = "SELECT * FROM users WHERE username='$username' AND password=SHA2('$password', 256)";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);

       
        $payload = [
            'iss' => 'your_issuer',  
            'iat' => time(),        
            'exp' => time() + 3600, 
            'username' => $username  
        ];

        $jwt = JWT::encode($payload, $jwt_secret, 'HS256');

        echo json_encode(["status" => "success", "token" => $jwt]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Invalid credentials."]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'upload-media') {
    // Verify JWT Token (no 'Bearer' prefix)
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader)) {
        echo json_encode(["status" => "fail", "message" => "Authorization header is missing."]);
        exit;
    }

    list($jwt) = sscanf($authHeader, 'Bearer %s');


    if (empty($jwt)) {
        echo json_encode(["status" => "fail", "message" => "Invalid token format."]);
        exit;
    }

    try {
        // Decode JWT token
        $decoded = JWT::decode($jwt, new Key($jwt_secret, 'HS256'));
    } catch (Exception $e) {
        echo json_encode(["status" => "fail", "message" => "Unauthorized. " . $e->getMessage()]);
        exit;
    }

    $metadata = $_POST['metadata'] ?? '';
    $file = $_FILES['file'] ?? null;

    // Validate metadata and file presence
    if (empty($metadata) || !$file) {
        echo json_encode(["status" => "fail", "message" => "Metadata or file is missing."]);
        exit;
    }

    // Check if the file is valid
    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(["status" => "fail", "message" => "File upload error."]);
        exit;
    }

    // MongoDB GridFS initialization
    $mongoGridFS = $mongoDatabase->selectGridFSBucket();

// Avaa tiedosto lukemista varten
$fileStream = fopen($file['tmp_name'], 'rb');
if ($fileStream === false) {
    echo json_encode(["status" => "fail", "message" => "Failed to open file for reading."]);
    exit;
}

if (!empty($metadata) && is_string($metadata)) {
    $metadata = ['info' => $metadata]; 
}

// Luo GridFS-tiedosto-dokumentti
try {
    // Lataa tiedosto GridFS:ään
    $fileId = $mongoGridFS->uploadFromStream(
        $file['name'], 
        $fileStream,
        [
            'metadata' => $metadata, 
            'contentType' => $file['type']
        ]
    );

    fclose($fileStream); // Sulje tiedoston stream

    // Luo dokumentti, joka tallennetaan MongoDB:hen (tallennetaan tiedoston ID ja metadata)
    $document = [
        'file_id' => $fileId,
        'metadata' => $metadata, // metadata tallennetaan
        'upload_date' => new MongoDB\BSON\UTCDateTime(),
    ];

    // Lisää dokumentti MongoDB:hen
    $mongoResult = $mongoCollection->insertOne($document);

    if ($mongoResult->getInsertedCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Media uploaded and saved in MongoDB."]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Failed to save the media in MongoDB."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "fail", "message" => "Error uploading file to MongoDB GridFS: " . $e->getMessage()]);
}
}
 elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'assign-task') {
    // Verify JWT Token
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader)) {
        echo json_encode(["status" => "fail", "message" => "Authorization header is missing."]);
        exit;
    }

    list($jwt) = sscanf($authHeader, 'Bearer %s');
    if (empty($jwt)) {
        echo json_encode(["status" => "fail", "message" => "Invalid token format."]);
        exit;
    }

    try {
        $decoded = JWT::decode($jwt, new Key($jwt_secret, 'HS256'));
    } catch (Exception $e) {
        echo json_encode(["status" => "fail", "message" => "Unauthorized. " . $e->getMessage()]);
        exit;
    }

    $taskId = $_POST['task_id'] ?? '';
    $expertId = $_POST['expert_id'] ?? '';

    if (empty($taskId) || empty($expertId)) {
        echo json_encode(["status" => "fail", "message" => "Task ID or expert ID is missing."]);
        exit;
    }

    $query = "UPDATE tasks SET assigned_to='$expertId' WHERE id='$taskId'";
    if (mysqli_query($conn, $query)) {
        echo json_encode(["status" => "success", "message" => "Task assigned."]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Task assignment failed."]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'review-media') {
    // Verify JWT Token
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader)) {
        echo json_encode(["status" => "fail", "message" => "Authorization header is missing."]);
        exit;
    }

    list($jwt) = sscanf($authHeader, 'Bearer %s');
    if (empty($jwt)) {
        echo json_encode(["status" => "fail", "message" => "Invalid token format."]);
        exit;
    }

    try {
        $decoded = JWT::decode($jwt, new Key($jwt_secret, 'HS256'));
    } catch (Exception $e) {
        echo json_encode(["status" => "fail", "message" => "Unauthorized. " . $e->getMessage()]);
        exit;
    }

    $taskId = $_POST['task_id'] ?? '';
    $annotations = $_POST['annotations'] ?? '';
    $status = $_POST['status'] ?? '';

    if (empty($taskId) || empty($annotations) || empty($status)) {
        echo json_encode(["status" => "fail", "message" => "Task ID, annotations, or status is missing."]);
        exit;
    }

    $mongoResult = $mongoCollection->insertOne(['task_id' => $taskId, 'annotations' => $annotations]);
    $query = "UPDATE tasks SET status='$status' WHERE id='$taskId'";

    if (mysqli_query($conn, $query) && $mongoResult->getInsertedCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Review updated."]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Review update failed."]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get-tasks') {
    // Verify JWT Token
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader)) {
        echo json_encode(["status" => "fail", "message" => "Authorization header is missing."]);
        exit;
    }

    list($jwt) = sscanf($authHeader, 'Bearer %s');
    if (empty($jwt)) {
        echo json_encode(["status" => "fail", "message" => "Invalid token format."]);
        exit;
    }

    try {
        $decoded = JWT::decode($jwt, new Key($jwt_secret, 'HS256'));
    } catch (Exception $e) {
        echo json_encode(["status" => "fail", "message" => "Unauthorized. " . $e->getMessage()]);
        exit;
    }

    $role = $_GET['role'] ?? '';

    if (empty($role)) {
        echo json_encode(["status" => "fail", "message" => "Role is missing."]);
        exit;
    }

    if ($role === 'admin') {
        $query = "SELECT * FROM tasks";
    } elseif ($role === 'expert') {
        $expertId = $_GET['user_id'] ?? '';
        $query = "SELECT * FROM tasks WHERE assigned_to='$expertId'";
    } elseif ($role === 'site_builder') {
        $builderId = $_GET['user_id'] ?? '';
        $query = "SELECT * FROM tasks WHERE created_by='$builderId'";
    } else {
        echo json_encode(["status" => "fail", "message" => "Invalid role."]);
        exit;
    }

    $result = mysqli_query($conn, $query);
    $tasks = mysqli_fetch_all($result, MYSQLI_ASSOC);

    echo json_encode(["status" => "success", "tasks" => $tasks]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get-reports') {
    $query = "SELECT assigned_to, COUNT(*) as completed_tasks FROM tasks WHERE status='OK' GROUP BY assigned_to";
    $result = mysqli_query($conn, $query);

    $report = mysqli_fetch_all($result, MYSQLI_ASSOC);
    echo json_encode(["status" => "success", "report" => $report]);


}   elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get-image') {
    // Verify JWT Token (optional, if you want to secure access)
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader)) {
        echo json_encode(["status" => "fail", "message" => "Authorization header is missing."]);
        exit;
    }

    list($jwt) = sscanf($authHeader, 'Bearer %s');
    if (empty($jwt)) {
        echo json_encode(["status" => "fail", "message" => "Invalid token format."]);
        exit;
    }

    try {
        $decoded = JWT::decode($jwt, new Key($jwt_secret, 'HS256'));
    } catch (Exception $e) {
        echo json_encode(["status" => "fail", "message" => "Unauthorized. " . $e->getMessage()]);
        exit;
    }

    // Get file_id from the query parameters
    $fileId = $_GET['file_id'] ?? '';
    if (empty($fileId)) {
        echo json_encode(["status" => "fail", "message" => "File ID is missing."]);
        exit;
    }

    try {
        // Convert file ID to MongoDB ObjectId
            $fileObjectId = new MongoDB\BSON\ObjectId("673f1e4e7fc4bbc405035c83");

        // Retrieve file from GridFS
        $stream = fopen('php://output', 'wb'); // Output stream for the file
        $mongoGridFS = $mongoDatabase->selectGridFSBucket();
        $mongoGridFS->downloadToStream($fileObjectId, $stream);

        // Retrieve the file's metadata
        $fileInfo = $mongoGridFS->findOne(['_id' => $fileObjectId]);
        if (!$fileInfo) {
            echo json_encode(["status" => "fail", "message" => "File not found."]);
            exit;
        }

        // Set headers and output file
        header("Content-Type: " . $fileInfo->contentType);
        header("Content-Disposition: inline; filename=\"" . $fileInfo->filename . "\"");

        fclose($stream); // Close the output stream
    } catch (Exception $e) {
        echo json_encode(["status" => "fail", "message" => "Error retrieving file: " . $e->getMessage()]);
        exit;
    }
}elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create-task') {
    // Verify JWT Token
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader)) {
        echo json_encode(["status" => "fail", "message" => "Authorization header is missing."]);
        exit;
    }

    list($jwt) = sscanf($authHeader, 'Bearer %s');
    if (empty($jwt)) {
        echo json_encode(["status" => "fail", "message" => "Invalid token format."]);
        exit;
    }

    try {
        $decoded = JWT::decode($jwt, new Key($jwt_secret, 'HS256'));
    } catch (Exception $e) {
        echo json_encode(["status" => "fail", "message" => "Unauthorized. " . $e->getMessage()]);
        exit;
    }

    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $createdBy = $decoded->username; // Retrieve the username from the decoded JWT.

    if (empty($title) || empty($description)) {
        echo json_encode(["status" => "fail", "message" => "Title or description is missing."]);
        exit;
    }

    $query = "INSERT INTO tasks (title, description, created_by) VALUES ('$title', '$description', '$createdBy')";
    if (mysqli_query($conn, $query)) {
        echo json_encode(["status" => "success", "message" => "Task created successfully."]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Task creation failed: " . mysqli_error($conn)]);
    }

} 
else {
    echo json_encode(["status" => "fail", "message" => "Invalid endpoint or method."]);
}

mysqli_close($conn);
?>
