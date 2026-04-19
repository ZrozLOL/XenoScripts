// ============================================
// ADBLOCK DETECTOR v2.0 - UPDATED VERSION
// ============================================
console.log('🔍 adblock.js v2.0 loaded - ALWAYS CHECK');
(function () {
    const SCRIPT_ID = new URLSearchParams(window.location.search).get('id') || "default";
    const ADBLOCK_KEY = "adblock_ok_" + SCRIPT_ID;
    
    // ❌ ЗАВЖДИ перевіряємо AdBlock — скидаємо старий результат
    sessionStorage.removeItem(ADBLOCK_KEY);
    
    console.log('🔍 Running AdBlock detection for script:', SCRIPT_ID);
    document.body.style.visibility = 'hidden';
    var blocked = false;
    var checkCompleted = false;
    
    function blockPage() {
        if (blocked || checkCompleted) return;
        blocked = true;
        checkCompleted = true;
        console.log('❌ AdBlock detected - blocking page');
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
    
    function allowPage() {
        if (blocked || checkCompleted) return;
        checkCompleted = true;
        sessionStorage.setItem(ADBLOCK_KEY, "true");
        document.body.style.visibility = 'visible';
        console.log('✅ AdBlock check passed - page allowed');
    }
    
    // Метод 1: XHR запит до рекламного скрипта
    var xhr = new XMLHttpRequest();
    var startTime = Date.now();
    xhr.open('GET', 'https://dcbbwymp1bhlf.cloudfront.net/?wbbcd=1253824&t=' + Date.now(), true);
    xhr.timeout = 5000;
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        var elapsed = Date.now() - startTime;
        console.log('📡 XHR completed: status=' + xhr.status + ', elapsed=' + elapsed + 'ms');
        
        if (xhr.status === 0) {
            // Запит заблоковано
            if (elapsed < 200) {
                // Швидка блокування = AdBlock активний
                blockPage();
            } else {
                // Повільна блокування = мережева помилка, не AdBlock
                allowPage();
            }
        } else {
            // Успішний запит = AdBlock вимкнено
            allowPage();
        }
    };
    
    xhr.ontimeout = function () {
        console.log('⏱️ XHR timeout - allowing page (slow network)');
        allowPage();
    };
    
    xhr.onerror = function () {
        var elapsed = Date.now() - startTime;
        console.log('⚠️ XHR error, elapsed=' + elapsed + 'ms');
        if (elapsed < 200) {
            blockPage();
        } else {
            allowPage();
        }
    };
    
    xhr.send();
    
    // Метод 2: Перевірка чи завантажилась змінна _adsLoaded
    setTimeout(function() {
        if (checkCompleted) return;
        
        // Якщо рекламні скрипти встигли завантажитись
        if (typeof window._adsLoaded !== 'undefined') {
            console.log('📢 _adsLoaded detected - ads are loading');
            allowPage();
        }
    }, 1000);
    
    // Fallback: якщо через 6 секунд нічого не сталося - дозволяємо доступ
    setTimeout(function () {
        if (!checkCompleted) {
            console.log('⏰ Timeout reached - allowing page (network issues)');
            allowPage();
        }
    }, 6000);
})();
