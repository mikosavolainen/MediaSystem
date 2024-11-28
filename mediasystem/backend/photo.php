<?php
require 'vendor/autoload.php';
use MongoDB\Client as MongoClient;

$serverName = "37.136.11.1";
$mongoClient = new MongoClient("mongodb://Kissa:KissaKala2146@37.136.11.1:27018/");
$mongoDatabase = $mongoClient->mediaserver;
$mongoGridFS = $mongoDatabase->selectGridFSBucket();

if (isset($_GET['file_id'])) {
    $file_id = $_GET['file_id'];

    try {
        // Retrieve file from GridFS by its file_id
        $fileStream = $mongoGridFS->openDownloadStream(new MongoDB\BSON\ObjectId($file_id));

        // Set headers to output image directly to the browser
        header('Content-Type: image/jpeg'); // or adjust based on the file type (PNG, etc.)
        header('Content-Disposition: inline; filename="image.jpg"'); // Adjust filename accordingly

        // Output the file to the browser
        echo stream_get_contents($fileStream);
    } catch (Exception $e) {
        echo json_encode(["status" => "fail", "message" => "Error retrieving file from MongoDB GridFS: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "fail", "message" => "No file_id provided."]);
}
?>
