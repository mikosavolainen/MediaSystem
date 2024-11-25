<?php
require 'vendor/autoload.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

try {
    // Yhteys MongoDB-palvelimeen
    $client = new Client("mongodb://Kissa:KissaKala2146@37.136.11.1:27018/");
    $collection = $client->mediasystem->images;

    // Tarkistetaan ObjectId-muoto
    $idString = "67444a886e117c5141091ef2"; // Vaihda oikeaan ID:hen
    if (!preg_match('/^[a-f\d]{24}$/i', $idString)) {
        throw new Exception("Virheellinen ObjectId-muoto: $idString");
    }

    $id = new ObjectId($idString);

    // Haetaan dokumentti
    $document = $collection->findOne(['_id' => $id]);

    if ($document === null) {
        echo "Kuvaa ei löytynyt ObjectId:llä $idString\n";
    } else {
        echo "Kuva löytyi!\n";

        // Oletetaan, että kuvatiedot ovat 'image_data'-kentässä
        header("Content-Type: image/jpeg");
        echo $document['image_data']->getData();
    }
} catch (MongoDB\Driver\Exception\Exception $e) {
    echo "MongoDB-virhe: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Virhe: " . $e->getMessage() . "\n";
}
