const productWrap = document.querySelector('.productWrap');
const cartableList = document.querySelector('.cartableList');
const discardAllBtn = document.querySelector('.discardAllBtn');

let productData = [];
let cartList = [];
axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {
        productData = response.data.products;
        console.log(productData);
        renderProductList(productData)
    })
    .catch(function (error) {
        console.log(error);
    })

/* 渲染產品列表 */
function renderProductList(productData) {
    let str = '';
    // [HTLM5] html元件上的 data-* 屬性 http://n.sfs.tw/content/index/10432 然後比對這個屬性
    productData.forEach(item => {
        let content = `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}"
            alt="">
        <a href="#" class="addCardBtn" data-id='${item.id}'>加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
        <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>`;
        str += content
        productWrap.innerHTML = str
    });
}

/* 篩選類別 */
const productSelect = document.querySelector('.productSelect');
productSelect.addEventListener('change', function () {
    let category = productSelect.value;
    if (category === '全部') {
        renderProductList(productData);
    } else {
        let chooseTypesData = [];
        productData.forEach(item => {
            if (item.category === category) {
                chooseTypesData.push(item);
            }
        });
        renderProductList(chooseTypesData);
    }
})

function init() {
    getCartList()
}
init()

/* 點擊加入購物車 */
productWrap.addEventListener('click', function (e) {
    e.preventDefault();
    let btn = e.target.getAttribute('class')
    if (btn !== 'addCardBtn') {
        return;
    }
    let productID = e.target.getAttribute('data-id');
    let numCheck = 1;

    cartList.forEach(item => {
        if (item.product.id === productID) {
            numCheck = item.quantity += 1;
        }
    });
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
        "data": {
            "productId": productID,
            "quantity": numCheck
        }
    }).then(function (response) {
        alert(`加入購物車 ･ᴥ･`);
        getCartList()
    })
        .catch(function (error) {
            console.log(error);
        })
})

/* 購物車明細 */
function getCartList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then(function (response) {
            cartList = response.data.carts;

            // 總金額計算
            const totalCost = document.querySelector('.js-final-total');
            totalCost.textContent = toThousands(response.data.finalTotal);

            // tboday 購物車明細更新
            
            if (cartList.length >= 1) {
                document.querySelector('.noProduct').style.display = 'none';
            }
            else {
                document.querySelector('.noProduct').style.display = 'block';
            }
            let str = '';
            cartList.forEach(item => {
                let content = `
                    <tr>
                        <td>
                            <div class="cardItem-title">
                                <img src="${item.product.images}" alt="">
                                <p>${item.product.title}</p>
                            </div>
                        </td>
                        <td>NT$${toThousands(item.product.price)}</td>
                        <td>${toThousands(item.quantity)}</td>
                        <td>NT$${toThousands(item.product.price * item.quantity)}</td>
                        <td class="discardBtn">
                            <a href="#" class="material-icons" data-id="${item.id}">
                                clear
                            </a>
                        </td>
                    </tr>`;
                str += content;
            });
            cartableList.innerHTML = str;
        })
        .catch(function (error) {
            console.log(error);
        })
}

/* 購物車單筆項目刪除 */
cartableList.addEventListener('click', function (e) {
    e.preventDefault();
    let cartID = e.target.getAttribute('data-id');
    if (cartID !== null) {
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartID}`)
            .then(function (response) {
                alert(`刪除單筆購物車成功 ʕ·͡ˑ·ཻʔ`);
                getCartList()
            }).catch(function (error) {
                console.log(error);
            })
    }
})

/* 購物車全部項目刪除 */

discardAllBtn.addEventListener('click', function (e) {
    e.preventDefault()
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then(function (response) {
            alert(`${response.data.message}`);
            getCartList()
        })
        .catch(function (error) {
            console.log(error);
        })
})

/* 購物車訂單 */
const orderInfoBtn = document.querySelector('.orderInfo-btn');
const orderForm = document.querySelector(".orderInfo-form");
const inputs = document.querySelectorAll("input[type=text],input[type=tel],input[type=email],select[type=text]")
orderInfoBtn.addEventListener('click', function (e) {
    e.preventDefault();

    /* 送出成功 - 條件1：購物車要有商品 */
    if (cartList.length === 0) {
        alert(`請將您喜歡的商品加入購物車喲 ･◡･`);
        return;
    }

    /* 送出成功 - 條件2 */
    const orderForm = document.querySelector(".orderInfo-form");
    const inputs = document.querySelectorAll("input[type=text],input[type=tel],input[type=email],select[type=text]")

    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value == '') return alert("填好所有內容才能送件喔 ⚆_⚆");
    }

    /* 通關後，訂單成立要 post 到資料庫 */
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
        "data": {
            "user": {
                "name": inputs[0].value,
                "tel": inputs[1].value,
                "email": inputs[2].value,
                "address": inputs[3].value,
                "payment": inputs[4].value
            }
        }
    })
        .then(function (response) {
            alert(`訂單送出成功 ﻌﻌﻌ❤︎`);
            orderForm.reset();
            getCartList();
        })
        .catch(function (error) {
            console.log(error);
        })
})

/* 表單驗證套件 */
// {
//     <attribute>: {
//     <validator name>: <validator options>
//     }
// }

const constraints = {
    "姓名": {
        presence: {
            allowEmpty: false,
            message: `是必填欄位`,
        },
    },
    "電話": {
        presence: {
            allowEmpty: false,
            message: `是必填欄位`,
        },
        length: {
            maximum: 10,                    // 輸入值不能長於此值
            message: "請填寫10碼的手機號"
        },
        numericality:{
            onlyInteger: true,
        },
        // format: {
        //     pattern: "/^[09]{2}\d(8)$/",
        //     message: "請填寫正確的手機格式"
        // }
    },
    "信箱": {
        presence: {
            allowEmpty: false,
            message: `是必填欄位`,
        },
        email: true,
    },
    "地址": {
        presence: {
            allowEmpty: false,
            message: `是必填欄位`,
        },
    },
    "交易方式": {
        presence: {
            allowEmpty: false,
            message: `請選擇一個付款方法`,
        },
    },
};
/* 對每一個 input 綁定監聽事件並且讓她啟動回傳訊息 */
inputs.forEach(item => {
    item.addEventListener('blur', function () {

        // input綁定監聽，然後在下一個同階元素輸入訊息
        item.nextElementSibling.textContent = "";

        // 按照文件放入 form 元素和條件都放進驗證，所有條件都回到error上
        let errors = validate(orderForm, constraints) || '';
        console.log(errors);

        // 回傳印在畫面上
        if (errors) {
            Object.keys(errors).forEach((item, idx) => {

                // 因為是在回圈內做網頁元素選取，所以每一個都會進來被綁一次
                document.querySelector(`[data-message="${item}"]`).textContent = Object.values(errors)[idx];
            });
        }
    })
});

/* 數字千分位表達 */
function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}