import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

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

// دالة الطباعة الاحترافية (معدلة لإخفاء التواريخ والروابط)
window.printPage = (url) => {
    printJS({
        printable: url,
        type: 'image',
        // كود CSS هذا يخبر المتصفح بإلغاء الهوامش، مما يؤدي تلقائياً لإخفاء رابط الموقع والتاريخ والترقيم
        style: '@page { margin: 0; } @media print { body { margin: 0; } img { width: 100% !important; height: auto !important; } }',
        imageStyle: 'width:100%; display:block;'
    });
};

// دالة حذف الطلب من قاعدة البيانات نهائياً
window.deleteOrder = (orderId) => {
    if (confirm("هل أنت متأكد من حذف هذا الطلب نهائياً؟")) {
        remove(ref(db, 'orders/' + orderId))
            .then(() => {
                console.log("تم حذف الطلب بنجاح");
            })
            .catch((error) => {
                alert("حدث خطأ أثناء الحذف: " + error.message);
            });
    }
};

// جلب وعرض الطلبات
onValue(ref(db, 'orders'), (snapshot) => {
    const list = document.getElementById('orders-list');
    list.innerHTML = "";
    
    if (!snapshot.exists()) {
        list.innerHTML = "<p style='text-align:center;'>لا توجد طلبات حالياً.</p>";
        return;
    }

    const ordersArray = [];
    snapshot.forEach(child => ordersArray.push({ id: child.key, ...child.val() }));
    
    // عرض الطلبات الحديثة أولاً
    ordersArray.reverse().forEach(order => {
        const date = new Date(order.timestamp).toLocaleString('ar-IQ');
        let pagesHtml = '';
        
        // التحقق القوي من وجود صفحات متعددة لضمان عرضها بالكامل
        let pagesToRender = [];
        if (order.pages && Array.isArray(order.pages)) {
            pagesToRender = order.pages;
        } else if (order.imgUrl) {
            pagesToRender = [order.imgUrl]; // دعم النظام القديم إذا وجد
        }

        // بناء بطاقات الصفحات داخل المجلد
        pagesToRender.forEach((pageUrl, index) => {
            pagesHtml += `
                <div class="page-card">
                    <p>صفحة ${index + 1}</p>
                    <img src="${pageUrl}" alt="صفحة ${index + 1}">
                    <button class="print-btn" onclick="printPage('${pageUrl}')">🖨️ طباعة</button>
                </div>
            `;
        });

        // طباعة المجلد في الشاشة
        list.innerHTML += `
            <div class="order-folder" id="folder-${order.id}">
                <div class="folder-header">
                    <h2>📁 زبون: ${order.customer}</h2>
                    <div class="folder-info">
                        <span>🕒 ${date}</span>
                        <button class="delete-btn" onclick="deleteOrder('${order.id}')">🗑️ حذف الطلب</button>
                    </div>
                </div>
                <div class="pages-grid">
                    ${pagesHtml}
                </div>
            </div>
        `;
    });
});
