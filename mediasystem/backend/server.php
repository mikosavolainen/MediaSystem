<?php

header('Access-Control-Allow-Origin: *');

header('Access-Control-Allow-Methods: GET, POST');

header("Access-Control-Allow-Headers: X-Requested-With");

require 'vendor/autoload.php';

$serverName = "37.136.11.1";
$userName = "root";
$password = "1234592";
$databaseName = "mediaserver";
$port = 3308;

$conn = mysqli_connect($serverName, $userName, $password, $databaseName, $port);
if (!$conn) {
    die(json_encode(["status" => "fail", "message" => "MySQL connection failed."]));
}

try {
    $mongoClient = new MongoDB\Client("mongodb://Kissa:KissaKala2146@37.219.64.107:27018/");
    $mongoDatabase = $mongoClient->mediaserver;
    $mongoCollection = $mongoDatabase->react_php;
} catch (Exception $e) {
    die(json_encode(["status" => "fail", "message" => "MongoDB connection failed: " . $e->getMessage()])));
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
        $token = bin2hex(random_bytes(16));
        echo json_encode(["status" => "success", "token" => $token]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Invalid credentials."]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'upload-media') {
    $metadata = $_POST['metadata'] ?? '';
    $file = $_FILES['file'] ?? null;

    if (empty($metadata) || !$file) {
        echo json_encode(["status" => "fail", "message" => "Metadata or file is missing."]);
        exit;
    }

    $uploadDir = 'uploads/';
    $filePath = $uploadDir . basename($file['name']);

    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        $query = "INSERT INTO media (file_path, metadata) VALUES ('$filePath', '$metadata')";
        mysqli_query($conn, $query);

        echo json_encode(["status" => "success", "message" => "Media uploaded."]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Upload failed."]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'assign-task') {
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
} else {
    echo json_encode(["status" => "fail", "message" => "Invalid endpoint or method."]);
}

mysqli_close($conn);
?>
