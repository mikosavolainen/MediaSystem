<?php
phpinfo();
require 'vendor/autoload.php';

$serverName = "37.136.11.1";
$userName = "root";
$password = "1234592";
$databaseName = "mediaserver";

$mongouri = 'mongodb://<hostname>:<port>/?tls=true&tlsDisableOCSPEndpointCheck=true';


try {
    $mongoClient = new MongoDB\Client($mongouri);
    $mongoDatabase = $mongoClient->mediaserver;
    $mongoCollection = $mongoDatabase->react_php;
    echo "Connected to MongoDB successfully.<br>";
} catch (Exception $e) {
    die("MongoDB connection failed: " . $e->getMessage());
}
//yhhy

$recText = $_POST['text'];


$conn = mysqli_connect($serverName, $userName, $password, $databaseName);
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}


$mysqlQuery = "INSERT INTO react_php (texts) VALUES ('$recText')";
if (mysqli_query($conn, $mysqlQuery)) {
    echo "Data has been inserted into MySQL successfully.<br>";
} else {
    echo "Error inserting into MySQL: " . mysqli_error($conn) . "<br>";
}


$mongoDocument = ['texts' => $recText];
$mongoResult = $mongoCollection->insertOne($mongoDocument);


if ($mongoResult->getInsertedCount() > 0) {
    echo "Data has been inserted into MongoDB successfully.";
} else {
    echo "Error inserting into MongoDB.";
}

mysqli_close($conn);
?>
