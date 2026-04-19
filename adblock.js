(function () {
    const SCRIPT_ID = new URLSearchParams(window.location.search).get('id') || "default";
    const STORAGE_KEY = "ad_passed_" + SCRIPT_ID;

    if (sessionStorage.getItem(STORAGE_KEY) === "true") return;

    document.body.style.visibility = 'hidden';

    var blocked = false;
    var checksDone = 0;
    var totalChecks = 2;
    var detectionsPassed = 0;
    var requiredDetections = 1;

    function blockPage() {
        if (blocked) return;
        blocked = true;
        document.body.style.visibility = 'visible';
        document.body.innerHTML = `
            <div style="
                display:flex;flex-direction:column;align-items:center;
                justify-content:center;min-height:100vh;
                background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
                color:white;font-family:'Segoe UI',sans-serif;
                text-align:center;padding:20px;
            ">
                <div style="font-size:80px;margin-bottom:20px;">🚫</div>
                <h1 style="font-size:32px;margin-bottom:15px;">Please Disable AdBlock</h1>
                <p style="font-size:16px;opacity:0.9;margin-bottom:30px;max-width:400px;">
                    We detected that you're using an ad blocker.<br>
                    Please disable it and refresh the page to continue.
                </p>
                <button onclick="location.reload()" style="
                    padding:18px 45px;font-size:18px;background:white;
                    color:#667eea;border:none;border-radius:50px;cursor:pointer;
                    font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.3);
                ">🔄 Refresh Page</button>
            </div>
        `;
    }

    function onCheckDone(detected) {
        if (blocked) return;
        if (detected) detectionsPassed++;
        checksDone++;

        if (detectionsPassed >= requiredDetections) {
            blockPage();
            return;
        }
        if (checksDone >= totalChecks) {
            document.body.style.visibility = 'visible';
        }
    }

    // ✅ 1. Bait div — перевіряємо тільки display:none або visibility:hidden
    // НЕ перевіряємо offsetHeight бо він може бути 0 і без адблоку
    (function () {
        var bait = document.createElement('div');
        bait.className = 'ad-banner ads adsbox adsbygoogle';
        bait.style.cssText = 'position:fixed;top:0;left:0;width:10px;height:10px;opacity:0;pointer-events:none;';
        document.body.appendChild(bait);

        setTimeout(function () {
            var s = window.getComputedStyle(bait);
            var detected = (
                s.display === 'none' ||
                s.visibility === 'hidden' ||
                s.opacity === '0' && bait.offsetHeight === 0
            );
            try { bait.remove(); } catch (e) {}
            onCheckDone(detected);
        }, 500);
    })();

    // ✅ 2. Fetch до AdMaven — спрацьовує бо ERR_BLOCKED_BY_CLIENT вже є в консолі
    fetch('https://dcbbwymp1bhlf.cloudfront.net/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
    }).then(function () {
        onCheckDone(false); // запит пройшов — адблоку немає
    }).catch(function () {
        onCheckDone(true);  // заблоковано
    });

    // Fallback — якщо щось зависло
    setTimeout(function () {
        if (!blocked && checksDone < totalChecks) {
            document.body.style.visibility = 'visible';
        }
    }, 3000);

})();
