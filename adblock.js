(function () {
    const SCRIPT_ID = new URLSearchParams(window.location.search).get('id') || "default";
    const STORAGE_KEY = "ad_passed_" + SCRIPT_ID;

    // Якщо вже пройшов — не перевіряємо
    if (sessionStorage.getItem(STORAGE_KEY) === "true") return;

    document.body.style.visibility = 'hidden';

    var detectionsPassed = 0;
    var requiredDetections = 2;
    var blocked = false;
    var checksDone = 0;
    var totalChecks = 3;

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

    // ✅ 1. Bait div — AdBlock ховає елементи з такими класами
    (function () {
        var bait = document.createElement('div');
        bait.className = 'ad-banner ads adsbox adsbygoogle';
        bait.style.cssText = 'height:1px!important;width:1px!important;position:absolute!important;left:-10000px!important;top:-1000px!important;';
        document.body.appendChild(bait);

        setTimeout(function () {
            var style = window.getComputedStyle(bait);
            var hidden = (
                bait.offsetHeight === 0 ||
                bait.offsetWidth === 0 ||
                style.display === 'none' ||
                style.visibility === 'hidden' ||
                style.opacity === '0'
            );
            try { bait.remove(); } catch (e) {}
            onCheckDone(hidden);
        }, 300);
    })();

    // ✅ 2. MutationObserver — AdBlock видаляє фейкові рекламні елементи
    (function () {
        var fakeAd = document.createElement('ins');
        fakeAd.className = 'adsbygoogle';
        fakeAd.style.cssText = 'display:block;width:1px;height:1px;position:absolute;left:-9999px;';
        document.body.appendChild(fakeAd);

        var removed = false;
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.removedNodes.forEach(function (node) {
                    if (node === fakeAd) removed = true;
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(function () {
            observer.disconnect();
            var detected = removed || fakeAd.offsetHeight === 0;
            try { fakeAd.remove(); } catch (e) {}
            onCheckDone(detected);
        }, 400);
    })();

    // ✅ 3. Fetch до відомого рекламного URL — AdBlock блокує мережевий запит
    fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
    }).then(function () {
        onCheckDone(false); // запит пройшов — адблоку немає
    }).catch(function () {
        onCheckDone(true);  // заблоковано
    });

    // Fallback: якщо щось зависло — через 2.5 сек показуємо сторінку
    setTimeout(function () {
        if (!blocked && checksDone < totalChecks) {
            document.body.style.visibility = 'visible';
        }
    }, 2500);

})();
