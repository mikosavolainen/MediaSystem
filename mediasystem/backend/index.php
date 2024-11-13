<?php
// MySQL Connection
$serverName = "37.136.11.1";
$userName = "root";
$password = "1234592";
$databaseName = "mediaserver";

// MongoDB Connection
try {
    // Use the correct class for MongoDB connection
    $mongoClient = new MongoDB\Client("mongodb://Kissa:KissaKala2146@37.219.64.107:27018/");
    $mongoDatabase = $mongoClient->mediaserver;
    $mongoCollection = $mongoDatabase->react_php;
    echo "Connected to MongoDB successfully.<br>";
} catch (Exception $e) {
    die("MongoDB connection failed: " . $e->getMessage());
}

// Get the text from POST request
$recText = $_POST['text'];

// MySQL connection
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
