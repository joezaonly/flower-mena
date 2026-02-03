const { createApp, ref, onMounted, watch } = Vue;

// Default products data
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

createApp({
    setup() {
        const tab = ref('products');
        const showModal = ref(false);
        const editingProduct = ref(null);
        
        const form = ref({
            name: '',
            description: '',
            price: 0,
            type: 'fresh',
            image: '',
            isValentine: false
        });

        // Load products from localStorage or use defaults
        const products = ref([]);
        const orders = ref([]);

        const loadData = () => {
            const savedProducts = localStorage.getItem('menaFlowerProducts');
            if (savedProducts) {
                products.value = JSON.parse(savedProducts);
            } else {
                products.value = [...defaultProducts];
                saveProducts();
            }

            const savedOrders = localStorage.getItem('menaFlowerOrders');
            if (savedOrders) {
                orders.value = JSON.parse(savedOrders);
            }
        };

        const saveProducts = () => {
            localStorage.setItem('menaFlowerProducts', JSON.stringify(products.value));
        };

        const openModal = (product = null) => {
            if (product) {
                editingProduct.value = product;
                form.value = { ...product };
            } else {
                editingProduct.value = null;
                form.value = {
                    name: '',
                    description: '',
                    price: 0,
                    type: 'fresh',
                    image: '',
                    isValentine: false
                };
            }
            showModal.value = true;
            setTimeout(() => lucide.createIcons(), 100);
        };

        const saveProduct = () => {
            if (editingProduct.value) {
                const index = products.value.findIndex(p => p.id === editingProduct.value.id);
                if (index !== -1) {
                    products.value[index] = { ...form.value, id: editingProduct.value.id };
                }
            } else {
                const newId = Math.max(...products.value.map(p => p.id), 0) + 1;
                products.value.push({ ...form.value, id: newId });
            }
            saveProducts();
            showModal.value = false;
            setTimeout(() => lucide.createIcons(), 100);
        };

        const deleteProduct = (id) => {
            if (confirm('คุณต้องการลบสินค้านี้ใช่ไหมคะ?')) {
                products.value = products.value.filter(p => p.id !== id);
                saveProducts();
            }
        };

        const formatPrice = (price) => {
            return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(price);
        };

        onMounted(() => {
            loadData();
            lucide.createIcons();
        });

        watch(tab, () => {
            setTimeout(() => lucide.createIcons(), 100);
        });

        return {
            tab, showModal, editingProduct, form, products, orders,
            openModal, saveProduct, deleteProduct, formatPrice
        };
    }
}).mount('#admin-app');
