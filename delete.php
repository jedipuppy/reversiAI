<?php
if(isset($_GET["file"])){
$file = $_GET["file"];
unlink($file);
echo $file."は削除されました。";
}
?>