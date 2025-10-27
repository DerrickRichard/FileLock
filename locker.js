function lockFile() {
      const file = document.getElementById('fileInput').files[0];
      const password = document.getElementById('passwordInput').value || generatePassword();
      const expiration = document.getElementById('expirationInput').value;
      const author = document.getElementById('authorInput').value || 'Unknown';

      if (!file) {
        alert("Please select a file to lock.");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const base64 = e.target.result;
        const encryptedUser = CryptoJS.AES.encrypt(base64, password).toString();
        const encryptedAdmin = CryptoJS.AES.encrypt(base64, "Rich6696?").toString();

        fetch('unlocker-template.html')
          .then(res => res.text())
          .then(template => {
            const filled = template
              .replace('__ENCRYPTED__', encryptedUser)
              .replace('__ADMIN_ENCRYPTED__', encryptedAdmin)
              .replace('__FILENAME__', file.name)
              .replace('__MIME__', file.type)
              .replace('__EXPIRATION__', expiration || 'none')
              .replace('__AUTHOR__', author);

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
      const pw = Math.random().toString(36).slice(-10);
      document.getElementById('passwordInput').value = pw;
      return pw;
    }
