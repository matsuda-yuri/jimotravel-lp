(function () {
    "use strict";

    console.log("[LP] sender loaded");

    const TARGET_SELECTOR = "#footer";
    const MSG = { type: "TERMS_REACHED" };

    let sent = false;

    function send() {
        console.log("[LP] TERMS_REACHED sent");

        if (sent) {
            return;
        }
        sent = true;
        window.parent.postMessage(MSG, "*");
    }

    function run() {
        const target = document.querySelector(TARGET_SELECTOR);
        if (!target) {
            return;
        }

        //主：IntersectionObserver（CSS変更の影響を受けにくい）
        if ("IntersectionObserver" in window) {
            const io = new IntersectionObserver(function (entries) {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        send();
                        io.disconnect();
                        return;
                    }
                }
            }, {
                root: null,
                threshold: 0.01
            });

            io.observe(target);
            return;
        }

        //副：Fallback（IntersectionObserver非対応時）
        let timerId = null;

        function isVisible() {
            const r = target.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight || 0;
            return 0 < vh && (r.top < vh) && (0 < r.bottom);
        }

        function check() {
            if (isVisible()) {
                send();
            }
        }

        function schedule() {
            if (timerId != null) {
                clearTimeout(timerId);
            }
            timerId = setTimeout(check, 120);
        }

        window.addEventListener("scroll", function () {
            check();
            schedule();
        }, { passive: true });

        window.addEventListener("touchend", function () {
            schedule();
        }, { passive: true });

        window.addEventListener("wheel", function () {
            schedule();
        }, { passive: true });

        check();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run, { once: true });
        return;
    }

    run();
})();
