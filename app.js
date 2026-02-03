const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        const view = ref('home');
        const filter = ref('all');
        const showCart = ref(false);
        const cart = ref([]);

        const products = ref([
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
        ]);

        const filteredProducts = computed(() => {
            let list = products.value;
            if (filter.value !== 'all') {
                list = list.filter(p => p.type === filter.value);
            }
            if (view.value === 'home') {
                return list.slice(0, 4); // แสดงแค่ 4 ชิ้นในหน้าแรก
            }
            return list;
        });

        const cartTotal = computed(() => {
            return cart.value.reduce((total, item) => total + item.price, 0);
        });

        const addToCart = (product) => {
            cart.value.push({...product});
            showCart.value = true;
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
            // ในระบบจริงอาจจะกรองเอาเฉพาะ Valentine
        };

        const checkout = () => {
            alert('คุณพ่อโจสั่งซื้อเรียบร้อยแล้วค่ะ! หนูจะรีบจัดส่งให้นะค๊าาา 🦞💖');
            cart.value = [];
            showCart.value = false;
        };

        onMounted(() => {
            lucide.createIcons();
        });

        return {
            view, filter, products, filteredProducts, cart, showCart, cartTotal,
            addToCart, removeFromCart, formatPrice, filterValentine, checkout
        };
    }
}).mount('#app');
