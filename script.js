import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAEX8BjlYjsHOxDwD-Wu9qyFyIR3Wb6RxQ",
    authDomain: "mtgr-24718.firebaseapp.com",
    databaseURL: "https://mtgr-24718-default-rtdb.firebaseio.com",
    projectId: "mtgr-24718",
    storageBucket: "mtgr-24718.firebasestorage.app",
    messagingSenderId: "385919783070",
    appId: "1:385919783070:web:64f2703ec8cc0fd1c5ab8f"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// دالة الطباعة الاحترافية
window.printPage = (url) => {
    printJS({
        printable: url,
        type: 'image',
        documentTitle: 'مكتبة أثر - طلب طباعة',
        imageStyle: 'width:100%;', // يضمن ملء ورقة الـ A4
        // مكتبة Print.js تفتح نافذة الطباعة الخاصة بالمتصفح
        // ومنها تختار (طباعة على الوجهين / ألوان / الخ)
    });
};

onValue(ref(db, 'orders'), (snapshot) => {
    const list = document.getElementById('orders-list');
    list.innerHTML = "";
    
    if (!snapshot.exists()) {
        list.innerHTML = "<p style='text-align:center;'>لا توجد طلبات حالياً.</p>";
        return;
    }

    const ordersArray = [];
    snapshot.forEach(child => ordersArray.push({ id: child.key, ...child.val() }));
    
    ordersArray.reverse().forEach(order => {
        const date = new Date(order.timestamp).toLocaleString('ar-IQ');
        
        // التعامل مع النظام القديم (صورة واحدة) والنظام الجديد (عدة صفحات)
        let pagesHtml = '';
        if (order.pages && Array.isArray(order.pages)) {
            order.pages.forEach((pageUrl, index) => {
                pagesHtml += `
                    <div class="page-card">
                        <p>صفحة ${index + 1}</p>
                        <img src="${pageUrl}" alt="صفحة ${index + 1}">
                        <button class="print-btn" onclick="printPage('${pageUrl}')">🖨️ طباعة هذه الصفحة</button>
                    </div>
                `;
            });
        } else if (order.imgUrl) {
            pagesHtml += `
                <div class="page-card">
                    <p>صفحة 1 (نظام قديم)</p>
                    <img src="${order.imgUrl}" alt="صفحة">
                    <button class="print-btn" onclick="printPage('${order.imgUrl}')">🖨️ طباعة</button>
                </div>
            `;
        }

        list.innerHTML += `
            <div class="order-folder">
                <div class="folder-header">
                    <h2>📁 زبون: ${order.customer}</h2>
                    <span>🕒 ${date}</span>
                </div>
                <div class="pages-grid">
                    ${pagesHtml}
                </div>
            </div>
        `;
    });
});
