<?PHP 
$serverName="37.136.11.1";
$userName="root";
$password="1234592";
$databaseName="mediaserver";
$conn = mysqli_connect($serverName, $userName, $password, $databaseName);

$recText = $_POST['text'];

$query = ("INSERT INTO react_php (texts) VALUES('$recText')");

if (mysqli_query($conn, $query)) {
  echo "Data has been inserted successfully";
}else {
  echo "Error";
}
?>