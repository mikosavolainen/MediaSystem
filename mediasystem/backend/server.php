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
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'assign-task') {
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

    $taskId = $_POST['media_id'] ?? '';
    $expertId = $_POST['assigned_to'] ?? '';

    if (empty($taskId) || empty($expertId)) {
        echo json_encode(["status" => "fail", "message" => "Task ID or expert ID is missing...",$expertId=>$taskId]);
        exit;
    }

    $query = "UPDATE tasks SET assigned_to='$expertId' WHERE media_id='$taskId'";
    if (mysqli_query($conn, $query)) {
        echo json_encode(["status" => "success", "message" => "Task assigned."]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Task assignment failed."]);
    }
} elseif($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get-experts'){

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
    $query = "SELECT username FROM users WHERE role = 'expert'";
    $x = mysqli_query($conn, $query);
    $report = mysqli_fetch_all($x, MYSQLI_ASSOC);
    echo json_encode(["status" => "success", "report" => $report]);
}elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'review-media') {
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
}elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get-tasks') {
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

    // Fetch user role from database
    $stmt = $conn->prepare("SELECT role FROM users WHERE username = ?");
    $stmt->bind_param("s", $decoded->username);
    $stmt->execute();
    $result = $stmt->get_result();
    $userdata = $result->fetch_assoc();
    $role = $userdata['role'] ?? null;

    if (empty($role)) {
        echo json_encode(["status" => "fail", "message" => "Role is missing or invalid."]);
        exit;
    }

    // Prepare query based on role
    $query = "";
    if ($role === 'sysadmin') {
        $query = "SELECT * FROM tasks";
        $stmt = $conn->prepare($query);
    } elseif ($role === 'expert') {
        $expertId = $_GET['user_id'] ?? '';
        if (empty($expertId)) {
            echo json_encode(["status" => "fail", "message" => "User ID is required for expert role."]);
            exit;
        }
        $query = "SELECT * FROM tasks WHERE assigned_to = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $expertId);
    } elseif ($role === 'user') {
        $query = "SELECT * FROM tasks WHERE created_by = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $decoded->username);
    } else {
        echo json_encode(["status" => "fail", "message" => "Invalid role."]);
        exit;
    }

    // Execute and fetch results
    $stmt->execute();
    $result = $stmt->get_result();
    $tasks = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode(["status" => "success", "tasks" => $tasks]);
    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get-reports') {
    $query = "SELECT assigned_to, COUNT(*) as completed_tasks FROM tasks WHERE status='OK' GROUP BY assigned_to";
    $result = mysqli_query($conn, $query);

    $report = mysqli_fetch_all($result, MYSQLI_ASSOC);
    echo json_encode(["status" => "success", "report" => $report]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get-image') {
    // Get file_id from the query parameters
    $fileId = $_GET['file_id'] ?? '';
    if (empty($fileId)) {
        echo json_encode(["status" => "fail", "message" => "File ID is missing."]);
        exit;
    }

    try {
        // Convert file ID to MongoDB ObjectId
        $fileObjectId = new MongoDB\BSON\ObjectId($fileId);

        // Retrieve file from GridFS
        $mongoGridFS = $mongoDatabase->selectGridFSBucket();
        $fileInfo = $mongoGridFS->findOne(['_id' => $fileObjectId]);

        if (!$fileInfo) {
            echo json_encode(["status" => "fail", "message" => "File not found."]);
            exit;
        }

        // Set headers for the image
        header("Content-Type: " . $fileInfo->contentType);
        header("Content-Disposition: inline; filename=\"" . $fileInfo->filename . "\"");

        // Open the stream and output the entire file at once
        $stream = $mongoGridFS->openDownloadStream($fileObjectId);
        $imageData = stream_get_contents($stream);  // Read the entire file at once

        // Output the image
        echo $imageData;

        fclose($stream); // Close the stream after outputting the image
    } catch (Exception $e) {
        echo json_encode(["status" => "fail", "message" => "Error retrieving file: " . $e->getMessage()]);
        exit;
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create-task') {
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
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create-task-with-media') {
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



    } catch (Exception $e) {
        echo json_encode(["status" => "fail", "message" => "Error uploading file to MongoDB GridFS: " . $e->getMessage()]);
    }


    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $createdBy = $decoded->username;

    if (empty($title) || empty($description)) {
        echo json_encode(["status" => "fail", "message" => "Title or description is missing."]);
        exit;
    }

    $query = "INSERT INTO tasks (title, description, created_by, media_id) VALUES ('$title', '$description', '$createdBy','$fileId')";
    if (mysqli_query($conn, $query)) {
        echo json_encode(["status" => "success", "message" => "Task created successfully."]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Task creation failed: " . mysqli_error($conn)]);
    }
} else {
    echo json_encode(["status" => "fail", "message" => "Invalid endpoint or method."]);
}

mysqli_close($conn);
