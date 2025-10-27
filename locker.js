<script>
  const encrypted = "__ENCRYPTED__";
  const filename = "__FILENAME__";
  const mime = "__MIME__";
  const author = "__AUTHOR__";
  let expirationRaw = "__EXPIRATION__";
  let expiration = expirationRaw !== "none" ? new Date(expirationRaw) : null;

  let revoked = false;
  let adminModeActive = false;

  // Inject author name
  document.getElementById('authorName').innerText = author;

  function formatExpiration(exp) {
    const date = exp.toLocaleDateString();
    const time = exp.toLocaleTimeString();
    return `Expires on: ${date} at ${time}`;
  }

  function formatRemaining(exp) {
    const now = new Date();
    let diff = Math.max(exp - now, 0);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);
    return `You have ${days} days and ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} left.`;
  }

  if (!expiration) {
    document.getElementById('expirationNotice').style.display = 'none';
    document.getElementById('timeRemaining').style.display = 'none';
  } else {
    document.getElementById('expirationNotice').innerText = formatExpiration(expiration);
    document.getElementById('timeRemaining').innerText = formatRemaining(expiration);
    setInterval(() => {
      document.getElementById('timeRemaining').innerText = formatRemaining(expiration);
    }, 1000);
  }

  let holdTimer = null;

  document.addEventListener('keydown', (e) => {
    if (e.key === '4') window._key4 = true;
    if (e.key === '5') window._key5 = true;

    if (window._key4 && window._key5 && !holdTimer) {
      holdTimer = setTimeout(() => {
        document.getElementById('adminTrigger').style.display = 'block';
      }, 3000);
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === '4') window._key4 = false;
    if (e.key === '5') window._key5 = false;
    clearTimeout(holdTimer);
    holdTimer = null;
  });

  function showAdminMenu() {
    const input = document.getElementById('adminPw').value;
    if (input === 'Rich6696?') {
      document.getElementById('adminTrigger').style.display = 'none';
      document.getElementById('adminMenu').style.display = 'block';
      adminModeActive = true;
    } else {
      document.getElementById('msg').innerText = "Incorrect admin password.";
    }
  }

  function showAdminUnlock() {
    document.getElementById('adminUnlockSection').style.display = 'block';
  }

  function unlockWithAdmin() {
    const input = document.getElementById('adminUnlockPw').value;
    if (input === 'Rich6696?' && adminModeActive) {
      unlock(true);
    } else {
      document.getElementById('msg').innerText = "Incorrect admin password.";
    }
  }

  function triggerDownload(blob) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    document.getElementById('msg').innerText = "File unlocked.";
  }

  function unlock(useAdmin = false) {
    const now = new Date();
    if (revoked) {
      document.getElementById('msg').innerText = "Access has been revoked.";
      return;
    }
    if (expiration && now > expiration) {
      document.getElementById('msg').innerText = "This file has expired.";
      return;
    }

    let decrypted;
    if (useAdmin && adminModeActive) {
      decrypted = CryptoJS.AES.decrypt(encrypted, "Rich6696?").toString(CryptoJS.enc.Utf8);
    } else {
      const pw = document.getElementById('pw').value;
      decrypted = CryptoJS.AES.decrypt(encrypted, pw).toString(CryptoJS.enc.Utf8);
    }

    if (!decrypted.startsWith("data:")) {
      document.getElementById('msg').innerText = "Incorrect password or corrupted file.";
      return;
    }

    fetch(decrypted)
      .then(res => res.blob())
      .then(blob => {
        triggerDownload(blob);
      });
  }
</script>
