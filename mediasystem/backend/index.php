<?php
// MySQL Connection
$serverName = "37.136.11.1";
$userName = "root";
$password = "1234592";
$databaseName = "mediaserver";

// MongoDB Connection
require '../backend/c'; // Make sure MongoDB library is installed with Composer
$mongoClient = new MongoDB\Client("mongodb://root:1234592@37.136.11.1:27017");
$mongoDatabase = $mongoClient->mediaserver;
$mongoCollection = $mongoDatabase->react_php;

// Get the text from POST request
$recText = $_POST['text'];

// MySQL query
$conn = mysqli_connect($serverName, $userName, $password, $databaseName);
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// MySQL query to insert data
$mysqlQuery = "INSERT INTO react_php (texts) VALUES ('$recText')";
if (mysqli_query($conn, $mysqlQuery)) {
    echo "Data has been inserted into MySQL successfully.<br>";
} else {
    echo "Error inserting into MySQL: " . mysqli_error($conn) . "<br>";
}

// MongoDB query to insert data
$mongoDocument = ['texts' => $recText];
$mongoResult = $mongoCollection->insertOne($mongoDocument);

// Check MongoDB insertion result
if ($mongoResult->getInsertedCount() > 0) {
    echo "Data has been inserted into MongoDB successfully.";
} else {
    echo "Error inserting into MongoDB.";
}

// Close MySQL connection
mysqli_close($conn);
?>
