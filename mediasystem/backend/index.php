<?php
require 'vendor/autoload.php';

$serverName = "37.136.11.1";
$userName = "root";
$password = "1234592";
$databaseName = "mediaserver";
$port = 3308;



try {
    $mongoClient = new MongoDB\Client("mongodb://Kissa:KissaKala2146@37.219.64.107:27018/");
    $mongoDatabase = $mongoClient->mediaserver;
    $mongoCollection = $mongoDatabase->react_php;
    echo "Connected to MongoDB successfully.<br>";
} catch (Exception $e) {
    die("MongoDB connection failed: " . $e->getMessage());
}
//yhhy

$conn = mysqli_connect($serverName, $userName, $password, $databaseName, $port);
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}


$mysqlQuery = "INSERT INTO react_php (texts) VALUES ('x')";
if (mysqli_query($conn, $mysqlQuery)) {
    echo "Data has been inserted into MySQL successfully.<br>";
} else {
    echo "Error inserting into MySQL: " . mysqli_error($conn) . "<br>";
}


$mongoDocument = ['texts' => $x];
$mongoResult = $mongoCollection->insertOne($mongoDocument);


if ($mongoResult->getInsertedCount() > 0) {
    echo "Data has been inserted into MongoDB successfully.";
} else {
    echo "Error inserting into MongoDB.";
}

mysqli_close($conn);
?>
