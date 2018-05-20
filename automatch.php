<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>6*6 othello</title>
<meta name="Description" content="" />
<meta name="Keywords"  content="" />
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha384-vFJXuSJphROIrBnz7yo7oB41mKfc8JzQZiCq4NCceLEaO4IHwicKwpJf9c9IpFgh" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js" integrity="sha384-alpBpkh1PFOepccYVYDB4do5UnbKysX5WZXm3XxPqe5iKTfUKjNkCk9SaVuEZflJ" crossorigin="anonymous"></script>
<link rel="stylesheet" type="text/css" media="screen,print" href="style.css" />
<script type="text/javascript" src="automatch.js"></script>
  <?php
foreach(glob('AI/{*.js}',GLOB_BRACE) as $file){
    if(is_file($file)){

        echo "<script type=text/javascript src=";
        echo $file;        
        echo "></script>";
    }
}
?>

</head>
<body>
<?php
if(isset($_GET["delete_file"])){
$delete_file = $_GET["delete_file"];
unlink($delete_file);
echo $delete_file."は削除されました。";
}
?>
<p>登録されたＡＩ</p>
<ul>
  <script>
  　AINameList = [];
  </script>
  <?php
foreach(array_filter(glob('AI/{*.js}',GLOB_BRACE),'is_file') as $file){
    if(is_file($file)){
      $filetime = $file;
      $file = str_replace('AI/', '', $file);
      $file = str_replace('.js', '', $file);
        echo "<li><a  href=\"automatch.php?delete_file=".$filetime."\"  onclick=\"return confirm('".$file."を削除してもよろしいですか？')\">";

        echo $file;  
        echo "</a>&nbsp;&nbsp<span style =\"color:gray; font-size:70%\"> ";
        echo  date ("F d Y H:i:s.", filemtime($filetime));         
        echo "</span></li>";

        echo "  <script>AINameList.push(\"";
        echo $file;        
        echo "\");</script>";
    }
}
?>
</ul>
<form name="Preference">
  <hr>
  <div class="form-row align-items-center"  >
    <div class="col-auto">
      対戦回数：<input type="text" name="NumOfMatch">
      <button type="button" class="btn btn-primary" onclick="restart()">開始</button>
    </div>
  </div>
</form>
<hr>
<p>黒の勝率</p>
<pre id ="matchNum"></pre>
  <div id="table"><table></table></div>   

</body>
</html>
