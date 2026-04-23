<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Select Interview</title>

<style>
/* 🔥 ANIMATED BLUE–PURPLE GRADIENT BG */
body {
    margin: 0;
    padding: 0;
    font-family: Poppins, sans-serif;
    background: linear-gradient(135deg, #0d0d1a, #1c004d, #002650, #330066);
    background-size: 400% 400%;
    animation: gradientMove 18s ease infinite;
    color: #fff;
}
@keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

select {
    background: #0d0d21;
    color: #ffffff;
    border: 1px solid #5b5bff;
    padding: 12px;
    border-radius: 10px;
    font-size: 16px;
}

select option {
    background: #0d0d21;
    color: white;
}


/* 🔥 GLASS EFFECT BOX */
.glass {
    backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    padding: 30px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    box-shadow: 0 8px 25px rgba(0,0,0,0.4);
}
.container { width: 45%; margin: 8% auto; }
select, button {
    width: 100%; padding: 14px;
    margin-top: 15px; font-size: 16px;
    border-radius: 8px; border: none; outline: none;
}
select { background: rgba(255,255,255,0.15); color: white; }
button {
    background: linear-gradient(135deg,#5f00ff,#009dff);
    color: white; font-weight: bold; cursor: pointer;
}
button:hover { opacity: 0.8; }
h2 { text-align:center; margin-bottom:20px; }
</style>

</head>

<body>

<div class="container glass">
    <h2>🎥 Start AI Interview</h2>

    <form action="interview_live.php" method="GET">
        <label>Career Path</label>
        <select name="role" required>
            <option value="Web Developer">Web Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="AI & ML Engineer">AI & ML Engineer</option>
            <option value="Cyber Security Specialist">Cyber Security Specialist</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
            <option value="QA Tester">QA Tester</option>
            <option value="Mobile App Developer">Mobile App Developer</option>
        </select>

        <label>Difficulty</label>
        <select name="difficulty" required>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
        </select>

        <button type="submit">Start Interview</button>
    </form>
</div>

</body>
</html>
