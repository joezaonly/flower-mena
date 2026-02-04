const { createApp, ref, computed, onMounted, watch, nextTick } = Vue;

// PromptPay QR Generator
const generatePromptPayQR = (phoneNumber, amount) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `https://promptpay.io/${cleanPhone}/${amount}.png`;
};

// Default products
const defaultProducts = [
    {
        id: 1,
        name: 'ช่อกุหลาบ Eternal Love',
        description: 'กุหลาบแดงคัดเกรดพรีเมียม 99 ดอก แทนรักนิรันดร์',
        price: 2500,
        type: 'fresh',
        isValentine: true,
        image: 'https://images.unsplash.com/photo-1548610762-7c6abc94c031?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 2,
        name: 'ช่อลิลลี่สีขาวบริสุทธิ์',
        description: 'ดอกลิลลี่ขาวสะอาดตา มอบความรู้สึกดีๆ ให้คนพิเศษ',
        price: 1200,
        type: 'fresh',
        isValentine: false,
        image: 'https://images.unsplash.com/photo-1596324317111-e1150c18442e?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 3,
        name: 'กล่องสแตติสแห่งความคิดถึง',
        description: 'ดอกสแตติสแห้งสีม่วงอ่อน เก็บความทรงจำได้นานแสนนาน',
        price: 850,
        type: 'dry',
        isValentine: false,
        image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 4,
        name: 'แจกันดอกฝ้ายมินิมอล',
        description: 'ดอกฝ้ายธรรมชาติสีขาวนวล ตกแต่งบ้านสไตล์มูจิ',
        price: 590,
        type: 'dry',
        isValentine: false,
        image: 'https://images.unsplash.com/photo-1563241527-3004b7be0fab?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 5,
        name: 'ช่อกุหลาบชมพู Sweetheart',
        description: 'กุหลาบสีชมพูหวานละมุน สำหรับวันวาเลนไทน์',
        price: 1800,
        type: 'fresh',
        isValentine: true,
        image: 'https://images.unsplash.com/photo-1561047029-3000c6812c8e?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 6,
        name: 'ชุดดอกไม้แห้งอบอวลรัก',
        description: 'รวมดอกไม้แห้งหลากหลายชนิด จัดลงแจกันแก้วสวยงาม',
        price: 1350,
        type: 'dry',
        isValentine: true,
        image: 'https://images.unsplash.com/photo-1503149779833-1de50ebe5f8a?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 7,
        name: 'ช่อดอกกุหลาบแดงดอกเดี่ยว',
        description: 'กุหลาบแดงดอกเดี่ยวพร้อมดอกยิปโซและสแตติส ห่อด้วยกระดาษสีแดงเบอร์กันดี้สุดหรู',
        price: 359,
        type: 'fresh',
        isValentine: true,
        image: '/images/rose-single.jpg'
    }
];

const PROMPTPAY_NUMBER = '0908478845';

createApp({
    setup() {
        const view = ref('home');
        const filter = ref('all');
        const showCart = ref(false);
        const cart = ref([]);
        
        const showCheckoutModal = ref(false);
        const checkoutStep = ref(1);
        const orderNumber = ref('');
        const customerInfo = ref({
            name: '',
            phone: '',
            address: '',
            note: ''
        });

        const products = ref([]);
        
        const loadProducts = async () => {
            try {
                // Fetch products from API (realtime)
                const response = await fetch('/api/products');
                if (response.ok) {
                    products.value = await response.json();
                } else {
                    // Fallback to default products
                    products.value = [...defaultProducts];
                }
            } catch (error) {
                console.error('Failed to load products:', error);
                products.value = [...defaultProducts];
            }
        };

        const filteredProducts = computed(() => {
            let list = products.value;
            if (filter.value !== 'all') {
                list = list.filter(p => p.type === filter.value);
            }
            if (view.value === 'home') {
                return list.slice(0, 4);
            }
            return list;
        });

        const cartTotal = computed(() => {
            return cart.value.reduce((total, item) => total + item.price, 0);
        });

        const addToCart = (product) => {
            cart.value.push({...product});
            showCart.value = true;
            nextTick(() => lucide.createIcons());
        };

        const removeFromCart = (index) => {
            cart.value.splice(index, 1);
        };

        const formatPrice = (price) => {
            return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price);
        };

        const filterValentine = () => {
            view.value = 'shop';
            filter.value = 'all';
        };

        const openCheckoutModal = () => {
            if (cart.value.length === 0) return;
            showCart.value = false;
            showCheckoutModal.value = true;
            checkoutStep.value = 1;
        };

        const goToPayment = () => {
            if (!customerInfo.value.name || !customerInfo.value.phone || !customerInfo.value.address) {
                alert('กรุณากรอกข้อมูลให้ครบถ้วนค่ะ');
                return;
            }
            checkoutStep.value = 2;
            nextTick(() => {
                const qrContainer = document.getElementById('qrcode');
                if (qrContainer) {
                    const qrUrl = generatePromptPayQR(PROMPTPAY_NUMBER, cartTotal.value);
                    qrContainer.innerHTML = `<img src="${qrUrl}" alt="PromptPay QR Code">`;
                }
            });
        };

        const confirmPayment = async () => {
            orderNumber.value = Date.now().toString().slice(-8);
            
            const order = {
                id: orderNumber.value,
                date: new Date().toLocaleString('th-TH'),
                items: [...cart.value],
                total: cartTotal.value,
                customerName: customerInfo.value.name,
                customerPhone: customerInfo.value.phone,
                customerAddress: customerInfo.value.address,
                customerNote: customerInfo.value.note,
                status: 'paid'
            };
            
            const orders = JSON.parse(localStorage.getItem('menaFlowerOrders') || '[]');
            orders.unshift(order);
            localStorage.setItem('menaFlowerOrders', JSON.stringify(orders));

            // Send to server for Telegram notification
            try {
                const notifyData = {
                    orderId: orderNumber.value,
                    customer: customerInfo.value,
                    items: cart.value.map(i => ({ name: i.name, price: i.price })),
                    itemNames: cart.value.map(i => i.name).join(', '),
                    total: cartTotal.value
                };
                
                await fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(notifyData)
                });
            } catch (e) {
                console.error('Notification error:', e);
            }

            checkoutStep.value = 3;
        };

        const closeCheckout = () => {
            showCheckoutModal.value = false;
            cart.value = [];
            customerInfo.value = { name: '', phone: '', address: '', note: '' };
            checkoutStep.value = 1;
        };

        onMounted(() => {
            loadProducts();
            lucide.createIcons();
        });

        watch([view, filter], () => {
            nextTick(() => lucide.createIcons());
        });

        return {
            view, filter, products, filteredProducts, cart, showCart, cartTotal,
            showCheckoutModal, checkoutStep, orderNumber, customerInfo,
            addToCart, removeFromCart, formatPrice, filterValentine,
            openCheckoutModal, goToPayment, confirmPayment, closeCheckout
        };
    }
}).mount('#app');
