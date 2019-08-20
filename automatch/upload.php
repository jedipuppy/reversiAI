<?php
header('Content-Type: text/html; charset=UTF-8');
$AIcode =  $_POST["AIcode"];
$filename = $_POST["filename"].'.js';
echo $filename."が登録されました。<br>";
echo "コード内容：".$AIcode;
file_put_contents("./AI/".$filename, $AIcode);
header("Location:automatch.php");
?>