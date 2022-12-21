let orderList = [];
const jsOrderList = document.querySelector('.js-orderList');

getOrdertable();

function getOrdertable() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            authorization: token,
        }
    })
        .then(function (response) {
            orderList = response.data.orders;
            let str = '';
            orderList.forEach(item => {
                /* 多項訂單品項重組 */
                let productsItem = '';
                item.products.forEach(item => {
                    productsItem += `${item.title}*${item.quantity}`;
                });

                /* 訂單建立時間重組 */
                let orderCreatTime = new Date(item.createdAt * 1000);
                orderTime = `${orderCreatTime.getFullYear()}/${orderCreatTime.getMonth() + 1}/${orderCreatTime.getDate()}`;

                /* 判斷訂單狀態處理 */
                let orderStatus = '';
                if (item.paid === false) orderStatus = `未處理`
                else orderStatus = `已處理`

                /* 組訂單表格 */
                str += `
                <tr>
                <td>${item.id}</td>
                <td>
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                    <p>${productsItem}</p>
                </td>
                <td>${orderTime}</td>
                <td class="orderStatus">
                    <a href="#" class="js-status" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
                </td>
                <td>
                    <input type="button" class="delSingleOrder-Btn js-delete" value="刪除" data-id="${item.id}">
                </td>
                </tr>`
            });
            jsOrderList.innerHTML = str;
            c3Chart();
        })
        .catch(function (error) {
            console.log(error);
        })
}

/* 刪除、修改按鈕監聽 */
jsOrderList.addEventListener('click', function (e) {
    e.preventDefault();
    let toggleBtn = e.target.getAttribute('class');
    let id = e.target.getAttribute('data-id');
    /* 修改狀態按鈕 */
    if (toggleBtn === 'js-status') {
        let status = e.target.getAttribute('data-status');
        editOrederStatus(status, id);
        return
    }

    /* 刪除項目按鈕 */
    if (toggleBtn === 'delSingleOrder-Btn js-delete') {
        deleteItem(id);
        return
    }
})

/* 修改狀態按鈕 */
function editOrederStatus(status, id) {
    console.log(status, id);
    let newStatus;
    if (status === "true") newStatus = false;
    else if (status === "false") newStatus = true;
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        "data": {
            "id": id,
            "paid": newStatus,
        }
    }, {
        headers: {
            authorization: token,
        }
    })
        .then(function (response) {
            alert(`訂單修改成功 g˙Ꙫ˙d`);
            getOrdertable();
        })
        .catch(function (error) {
            console.log(error);
        })
}

/* 刪除單筆項目按鈕 */
function deleteItem(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
        headers: {
            authorization: token,
        }
    })
        .then(function (response) {
            alert(`訂單刪除成功 ʕ̯•͡ˑ͓•̯᷅ʔ`);
            getOrdertable();
        })
        .catch(function (error) {
            console.log(error);
        })
}

/* 刪除全部項目按鈕 */
const discardAllBtn = document.querySelector('.discardAllBtn')
discardAllBtn.addEventListener('click', function (e) {
    e.preventDefault();
    console.log(e.target);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`, {
        headers: {
            authorization: token,
        }
    })
        .then(function (response) {
            console.log(response);
            alert(`${response.data.message}`);
            getOrdertable();
        })
        .catch(function (error) {
            console.log(error);
        })
})

/* 全產品類別營收比重範例 */
function c3Chart() {
    /* 第一步：蒐集資料 */
    let collectData = {};
    let collectProduct = {};
    orderList.forEach(item => {
        item.products.forEach(item => {
            if (collectData[item.category] === undefined) {
                collectData[item.category] = item.price * item.quantity;
            } else {
                collectData[item.category] += item.price * item.quantity;
            }
            if (collectProduct[item.title] === undefined) {
                collectProduct[item.title] = item.price * item.quantity;
            } else {
                collectProduct[item.title] += item.price * item.quantity;
            }
        });
    });

    /* 第二步：處理成C3.js要的資料 */
    let newData = [];
    let productData = [];

    Object.keys(collectData).forEach(item => {
        let arr = [];
        arr.push(item);
        arr.push(collectData[item]);
        newData.push(arr);
    });

    Object.keys(collectProduct).forEach(productItem => {
        let arr = [];
        arr.push(productItem);
        arr.push(collectProduct[productItem]);
        productData.push(arr);
    });

    // 排序(第4項以後列為其他)
    let newProductData = productData.sort(function (a, b) {
        return b[1] - a[1]
    })
    if (newProductData.length > 3) {
        let othersCost = 0;
        for (let i = 3; i < newProductData.length; i++) {
            othersCost += newProductData[i][1]
        }
        newProductData.splice(3, newProductData.length - 1);
        newProductData.push(['其他', othersCost])
    }
    console.log(newProductData[0][0]);
    let first = newProductData[0][0]

    /* 第三步：套用在 C3.js donut chart setup */
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
            colors: {
                "窗簾": "#DACBFF",
                "床架": "#9D7FEA",
                "收納": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });

    let chart2 = c3.generate({
        bindto: '#chart2', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newProductData,
            colors: {
                [newProductData[0][0]]: "#DACBFF",
                [newProductData[1][0]]: "#9D7FEA",
                [newProductData[2][0]]: "#5434A7",
                [newProductData[3][0]]: "#301E5F",
            }
        },
    });
}






