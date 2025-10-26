function lockFile() {
  const file = document.getElementById('fileInput').files[0];
  const password = document.getElementById('passwordInput').value || generatePassword();
  const expiration = document.getElementById('expirationInput').value;

  if (!file || !expiration) {
    alert("Please select a file and set expiration.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64 = e.target.result;
    const encrypted = CryptoJS.AES.encrypt(base64, password).toString();

    fetch('unlocker-template.html')
      .then(res => res.text())
      .then(template => {
        const filled = template
          .replace('__ENCRYPTED__', encrypted)
          .replace('__FILENAME__', file.name)
          .replace('__MIME__', file.type)
          .replace('__EXPIRATION__', expiration);

        const blob = new Blob([filled], { type: "text/html" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "unlock-" + file.name + ".html";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };
  reader.readAsDataURL(file);
}

function generatePassword() {
  return Math.random().toString(36).slice(-10);
}
