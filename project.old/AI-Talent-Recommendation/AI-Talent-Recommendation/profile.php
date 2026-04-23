<?php
// profile.php
session_start();
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
$user_id = (int)$_SESSION['user_id'];

// Handle POST save + file upload
$errors = [];
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // sanitize inputs
    $fullname   = trim($_POST['fullname'] ?? '');
    $phone      = trim($_POST['phone'] ?? '');
    $education  = trim($_POST['education'] ?? '');
    $experience = trim($_POST['experience'] ?? '');
    $skills     = trim($_POST['skills'] ?? '');

    // Basic server-side validation
    if ($fullname === '') $errors[] = "Full name is required.";
    if ($phone === '') $errors[] = "Phone number is required.";

    // PROFILE PHOTO upload (optional)
    $profile_photo_path = null;
    if (!empty($_FILES['profile_photo']) && $_FILES['profile_photo']['error'] !== UPLOAD_ERR_NO_FILE) {
        $f = $_FILES['profile_photo'];

        // Validate upload
        if ($f['error'] !== UPLOAD_ERR_OK) {
            $errors[] = "Error uploading photo.";
        } else {
            $allowed = ['image/jpeg','image/jpg','image/png'];
            if (!in_array($f['type'], $allowed)) {
                $errors[] = "Profile photo must be JPG or PNG.";
            }
            if ($f['size'] > 2 * 1024 * 1024) { // 2MB limit
                $errors[] = "Profile photo must be under 2MB.";
            }
        }

        // Move file if no errors
        if (empty($errors)) {
            $ext = pathinfo($f['name'], PATHINFO_EXTENSION);
            $safeName = 'user_' . $user_id . '_' . time() . '.' . $ext;
            $uploadDir = __DIR__ . '/uploads/profile_photos/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            $dest = $uploadDir . $safeName;

            if (!move_uploaded_file($f['tmp_name'], $dest)) {
                $errors[] = "Failed to save uploaded file.";
            } else {
                // Save relative path to db
                $profile_photo_path = 'uploads/profile_photos/' . $safeName;
            }
        }
    }

    // If no errors, update DB
    if (empty($errors)) {
        // Build update SQL, include profile_photo only if provided
        if ($profile_photo_path) {
            $sql = "UPDATE users SET fullname=?, phone=?, education=?, experience=?, skills=?, profile_completed=1, profile_photo=? WHERE id=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssssssi",
                $fullname, $phone, $education, $experience, $skills, $profile_photo_path, $user_id
            );
        } else {
            $sql = "UPDATE users SET fullname=?, phone=?, education=?, experience=?, skills=?, profile_completed=1 WHERE id=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssssi",
                $fullname, $phone, $education, $experience, $skills, $user_id
            );
        }

        if ($stmt->execute()) {
            $success = "Profile updated successfully.";
            // reload user
            $stmt->close();
            $stmt = $conn->prepare("SELECT fullname, phone, education, experience, skills, profile_photo, profile_completed FROM users WHERE id=? LIMIT 1");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
            $stmt->close();
        } else {
            $errors[] = "Database update failed: " . $stmt->error;
        }
    }
}

// Initial load: fetch user
if (!isset($user)) {
    $stmt = $conn->prepare("SELECT fullname, phone, education, experience, skills, profile_photo, profile_completed FROM users WHERE id=? LIMIT 1");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();
}

// Helper: compute profile completeness
$fields = [
    'fullname' => !empty($user['fullname']),
    'phone' => !empty($user['phone']),
    'education' => !empty($user['education']),
    'experience' => !empty($user['experience']),
    'skills' => !empty($user['skills']),
    'photo' => !empty($user['profile_photo'])
];
$totalFields = count($fields);
$filled = 0; foreach ($fields as $v) if ($v) $filled++;
$progressPercent = (int)(($filled / $totalFields) * 100);

?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Complete Profile</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    /* Internal CSS - modern card */
    :root{ --accent:#00eaff; --accent2:#7b39ff; --bg:#071028; --card:#0f1b33; }
    body{ margin:0; font-family:Poppins,system-ui,Segoe UI,Roboto; background:linear-gradient(135deg,#020618,#04102a); color:#e8f6ff; display:flex; justify-content:center; padding:34px 12px;}
    .card{ width:100%; max-width:880px; background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border-radius:12px; padding:22px; border:1px solid rgba(127,219,255,0.06); box-shadow:0 10px 30px rgba(2,6,23,0.6);}
    .row{ display:flex; gap:20px; flex-wrap:wrap;}
    .left{ flex:0 0 320px; min-width:260px;}
    .right{ flex:1; min-width:260px;}
    h2{ margin:0 0 8px;color:var(--accent);}
    label{ display:block; font-size:13px; margin-top:12px; color:#cfefff; }
    input[type="text"], textarea, select{ width:100%; padding:11px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background:#081428; color:#e8f6ff; box-sizing:border-box; }
    textarea{ min-height:100px; resize:vertical;}
    .photo-box{ background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:12px; border-radius:10px; text-align:center; border:1px solid rgba(255,255,255,0.03);}
    .photo-box img{ width:160px; height:160px; object-fit:cover; border-radius:8px; border:2px solid rgba(123,57,255,0.18); }
    .upload-btn{ margin-top:10px; display:inline-block; padding:8px 12px; border-radius:8px; background:linear-gradient(90deg,var(--accent),var(--accent2)); color:#001; font-weight:700; cursor:pointer; border:none;}
    .progress-wrap{ margin-top:16px; }
    .progress-bar{ height:12px; background:linear-gradient(90deg,var(--accent),var(--accent2)); border-radius:8px; width:0%; transition:width 400ms ease; box-shadow:0 6px 18px rgba(59,45,120,0.12); }
    .progress-bg{ width:100%; height:12px; background:rgba(255,255,255,0.03); border-radius:8px; padding:2px; }
    .meta{ margin-top:10px; font-size:13px; color:#bfe8ff;}
    .btn-save{ margin-top:18px; padding:12px 16px; border-radius:10px; background:linear-gradient(90deg,var(--accent),var(--accent2)); color:#001; border:none; font-weight:800; cursor:pointer; }
    .note{ font-size:13px; color:#bfe8ff; margin-top:8px; }
    .errors{ background:rgba(255,0,0,0.06); color:#ffdada; padding:10px; border-radius:8px; margin-bottom:12px;}
    .success{ background:rgba(0,255,128,0.06); color:#dfffe6; padding:10px; border-radius:8px; margin-bottom:12px;}
    @media(max-width:760px){ .row{flex-direction:column;} .left{order:2} .right{order:1} .photo-box img{ width:120px; height:120px; } }
  </style>
</head>
<body>

<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
            <h2>Complete Your Profile</h2>
            <div class="meta">Help employers find you — fill details and add a profile photo.</div>
        </div>
        <div style="text-align:right;">
            <div style="font-size:13px;color:#cfefff">Profile Completion</div>
            <div class="progress-bg" style="width:220px;">
                <div id="progressBar" class="progress-bar" style="width:<?= $progressPercent ?>%;"></div>
            </div>
            <div style="margin-top:6px;font-weight:700;color:<?= $progressPercent>=75? '#a8ffd6' : '#ffdca8' ?>;"><?= $progressPercent ?>%</div>
        </div>
    </div>

    <?php if (!empty($errors)): ?>
        <div class="errors">
            <?php foreach ($errors as $er) echo "<div>• ".htmlspecialchars($er)."</div>"; ?>
        </div>
    <?php endif; ?>

    <?php if ($success): ?>
        <div class="success"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>

    <form method="POST" enctype="multipart/form-data">
        <div class="row">
            <div class="left">
                <div class="photo-box">
                    <?php if (!empty($user['profile_photo']) && file_exists(__DIR__ . '/' . $user['profile_photo'])): ?>
                        <img id="previewImg" src="<?= htmlspecialchars($user['profile_photo']) ?>" alt="Profile Photo">
                    <?php else: ?>
                        <img id="previewImg" src="data:image/svg+xml;utf8,<?php
                            // simple placeholder SVG encoded
                            $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="%23081328"/><text x="50%" y="50%" fill="%23a6eaff" font-size="20" font-family="Arial" text-anchor="middle" alignment-baseline="central">Upload</text></svg>';
                            echo rawurlencode($svg);
                        ?>" alt="Profile Photo">
                    <?php endif; ?>

                    <div style="margin-top:10px;">
                        <label class="upload-btn">
                            Choose Photo
                            <input id="photoInput" type="file" name="profile_photo" accept=".png,.jpg,.jpeg" style="display:none">
                        </label>
                    </div>
                    <div class="note">Accepted: JPG, PNG — Max 2 MB</div>
                </div>
            </div>

            <div class="right">
                <label>Full Name</label>
                <input type="text" name="fullname" required value="<?= htmlspecialchars($user['fullname'] ?? '') ?>">

                <label>Phone Number</label>
                <input type="text" name="phone" required value="<?= htmlspecialchars($user['phone'] ?? '') ?>">

                <label>Education</label>
                <input type="text" name="education" value="<?= htmlspecialchars($user['education'] ?? '') ?>">

                <label>Work Experience</label>
                <textarea name="experience"><?= htmlspecialchars($user['experience'] ?? '') ?></textarea>

                <label>Your Skills (comma-separated)</label>
                <textarea name="skills"><?= htmlspecialchars($user['skills'] ?? '') ?></textarea>

                <button type="submit" class="btn-save">Save Profile</button>

                <div style="display:flex;gap:10px;margin-top:12px;align-items:center;">
                    <a href="student_dashboard.php" class="btn" style="background:rgba(255,255,255,0.05);color:#cfefff;border-radius:8px;padding:8px 12px;text-decoration:none;">Back to Dashboard</a>
                    <div style="flex:1"></div>
                    <div class="small">Fields marked required will improve your chances.</div>
                </div>
            </div>
        </div>
    </form>
</div>

<script>
  // client-side preview + validation
  const photoInput = document.getElementById('photoInput');
  const previewImg = document.getElementById('previewImg');
  photoInput.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const allowed = ['image/jpeg','image/jpg','image/png'];
    if (!allowed.includes(f.type)) { alert('Only JPG/PNG allowed'); photoInput.value=''; return; }
    if (f.size > 2*1024*1024) { alert('Max 2MB allowed'); photoInput.value=''; return; }
    const url = URL.createObjectURL(f);
    previewImg.src = url;
  });

  // clicking the visible button triggers file input
  document.querySelector('.upload-btn').addEventListener('click', ()=> photoInput.click());
</script>
</body>
</html>
