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

// الاستماع للطلبات الجديدة في الوقت الفعلي
onValue(ref(db, 'orders'), (snapshot) => {
    const list = document.getElementById('orders-list');
    list.innerHTML = "";
    
    if (!snapshot.exists()) {
        list.innerHTML = "<p>لا توجد طلبات حالياً.</p>";
        return;
    }

    // تحويل البيانات إلى مصفوفة لعكس الترتيب (الأحدث أولاً)
    const ordersArray = [];
    snapshot.forEach(child => {
        ordersArray.push({ id: child.key, ...child.val() });
    });
    
    ordersArray.reverse().forEach(order => {
        const date = new Date(order.timestamp).toLocaleString('ar-IQ');
        list.innerHTML += `
            <div class="order-card">
                <h3>اسم الزبون: ${order.customer}</h3>
                <p>وقت الطلب: ${date}</p>
                <img src="${order.imgUrl}" alt="معاينة المجلة">
                <br>
                <button class="admin-btn" onclick="window.open('${order.imgUrl}', '_blank')">فتح الصورة بملء الشاشة للطباعة</button>
            </div>
        `;
    });
});
