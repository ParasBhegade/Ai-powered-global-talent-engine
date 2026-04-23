<?php
session_start();
include("config.php");

// Check login
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION['user_id'];

// When user chooses a career path
if (isset($_POST['choose'])) {
    $path_id = $_POST['path_id'];

    $_SESSION['selected_path'] = $path_id;

    mysqli_query($conn, "UPDATE users SET selected_path=$path_id WHERE id=$user_id");

    header("Location: skills.php");
    exit;
}

// Fetch all paths
$paths = mysqli_query($conn, "SELECT * FROM career_paths");
?>

<!DOCTYPE html>
<html>
<head>
<title>Select Career Path</title>

<style>
body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    color: white;
    background: linear-gradient(-45deg, #110022, #001133, #002244, #330033);
    background-size: 400% 400%;
    animation: moveBG 12s infinite;
}

@keyframes moveBG {
    0% {background-position: 0 50%;}
    50% {background-position: 100% 50%;}
    100% {background-position: 0 50%;}
}

.container {
    width: 90%;
    margin: auto;
    padding-top: 50px;
}

h1 {
    text-align: center;
    color: #00eaff;
    text-shadow: 0 0 18px #00eaff;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 25px;
    margin-top: 40px;
}

.card {
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px);
    border: 1px solid #00eaff88;
    box-shadow: 0 0 18px #00eaff66;
    padding: 20px;
    border-radius: 15px;
    transition: 0.4s;
    position: relative;
}

.card:hover {
    transform: scale(1.07);
    box-shadow: 0 0 30px #00eaff;
}

.card h3 {
    color: #00eaff;
    text-shadow: 0 0 12px #00eaff;
}

button {
    width: 100%;
    margin-top: 10px;
    padding: 12px;
    background: #00eaff;
    border: none;
    border-radius: 8px;
    color: black;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
}

button:hover {
    background: #7d2cff;
    color: white;
    box-shadow: 0 0 15px #7d2cff;
}
</style>

</head>
<body>

<div class="container">
    <h1>✨ Select Your Career Path</h1>

    <div class="grid">

        <?php while ($row = mysqli_fetch_assoc($paths)) { ?>
        <div class="card">
            <h3><?php echo $row['name']; ?></h3>
            <p><?php echo $row['description']; ?></p>

            <form method="POST">
                <input type="hidden" name="path_id" value="<?php echo $row['id']; ?>">
                <button type="submit" name="choose">Choose Path</button>
            </form>
        </div>
        <?php } ?>

    </div>
</div>

</body>
</html>