const { createApp, ref, computed, onMounted, watch, nextTick } = Vue;

// PromptPay QR Generator
const generatePromptPayQR = (phoneNumber, amount) => {
    // ใช้ API สร้าง PromptPay QR
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
    }
];

// PromptPay Number (ใส่เบอร์จริงตรงนี้)
const PROMPTPAY_NUMBER = '0812345678';

createApp({
    setup() {
        const view = ref('home');
        const filter = ref('all');
        const showCart = ref(false);
        const cart = ref([]);
        
        // Checkout states
        const showCheckoutModal = ref(false);
        const checkoutStep = ref(1);
        const orderNumber = ref('');
        const customerInfo = ref({
            name: '',
            phone: '',
            address: '',
            note: ''
        });

        // Load products from localStorage
        const products = ref([]);
        
        const loadProducts = () => {
            const saved = localStorage.getItem('menaFlowerProducts');
            if (saved) {
                products.value = JSON.parse(saved);
            } else {
                products.value = [...defaultProducts];
                localStorage.setItem('menaFlowerProducts', JSON.stringify(defaultProducts));
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

        // Checkout Functions
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
                // Generate QR Code
                const qrContainer = document.getElementById('qrcode');
                if (qrContainer) {
                    const qrUrl = generatePromptPayQR(PROMPTPAY_NUMBER, cartTotal.value);
                    qrContainer.innerHTML = `<img src="${qrUrl}" alt="PromptPay QR Code">`;
                }
            });
        };

        const confirmPayment = async () => {
            // Generate order number
            orderNumber.value = Date.now().toString().slice(-8);
            
            // Save order to localStorage
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

            // Send notification (will be handled by webhook)
            try {
                const notifyData = {
                    orderId: orderNumber.value,
                    customer: customerInfo.value,
                    items: cart.value.map(i => i.name).join(', '),
                    total: cartTotal.value
                };
                console.log('Order placed:', notifyData);
                // Webhook call would go here
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
