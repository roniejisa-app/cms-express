# Cách kiểu type trong CMS

- Các field được cấu hình trong model và trong static function ```fields```  của class model

## Giá trị khi cấu hình các field cơ bản đều có

- name: (string) - Tên cột trong bảng
- label: (string) - Tên hiển ngoài table và form
- type: (string) - Kiểu dữ liệu
- show: (boolean) - Hiển thị bên ngoài table (Xem)
- showForm: (boolean) - Hiển thị bên trong form (Thêm, Sửa)
- positionSidebar: (boolean) - form có 2 bên bên to điền false, bên nhỏ điền true
- filter: (boolean) - Bật bộ lọc ở bên ngoài

## Đơn giản

### TEXT

```javascript
{
    name: 'fullname',
    label: 'Tên',
    type: 'text',
    show: true,
    showForm: true,
    positionSidebar: false,
    filter: true,
    sort: true
}
```

### STATUS

```javascript
{
    name: 'active',
    label: 'Trạng thái',
    type: 'status',
    show: true,
    showForm: true,
    positionSidebar: true,
    options: [
        {
            value: 1,
            name: 'Kích Hoạt',
        },
        {
            value: 0,
            name: 'Tắt kích hoạt',
        },
    ],
},
```

- Các thuộc tính và lưu ý đặt biệt:

- Lưu ý: Nếu được hãy đặt option item có 2 thuộc tính là value, name để không cần chỉnh sửa core nhiều

### PASSWORD

```javascript
{
    name: 'password',
    label: 'Mật khẩu',
    type: 'password',
    show: false,
    showForm: true,
    hash: true,
    positionSidebar: false,
},
```

- Các thuộc tính và lưu ý đặt biệt:

1. hash - (boolean) để có thể mã hóa dữ liệu dưới dạng bcrypt

## Phức Tạp

### SELECT

```javascript
{
    name: 'type',
    label: 'Loại cơ sở dữ liệu',
    type: 'select',
    keyValue: 'value',
    keyShow: 'name',
    options: [
        {
            value: 'sql',
            name: 'SQL',
        },
        {
            value: 'nosql',
            name: 'NoSQL',
        },
    ],
    show: true,
    showForm: true,
    positionSidebar: true,
    filter: false,
    order: null, // null || number,
}
```

- Các thuộc tính và lưu ý đặt biệt:

1. keyValue: (string) - là thuộc tính để lưu trữ trong cơ sở dữ liệu
2. keyShow: (string) - là thuộc tính hiển thị bên ngoài nhìn thấy
3. options: (array) - Là nơi lưu các giá trị được chọn

- Lưu ý: Nếu được hãy đặt option item có 2 thuộc tính là value, name để không cần chỉnh sửa core nhiều

### SELECT IN TABLE OTHER

```javascript
{
    name: 'provider_id',
    ...selectAssoc('Provider', 'id', 'name'),
    label: 'Đăng nhập qua',
    show: false,
    showForm: true,
    positionSidebar: true,
    // filter: true,
},
```

Các thuộc tính và lưu ý đặt biệt:

- Cần sử dụng hàm ```selectAssoc``` cần truyền đủ danh sách sau:

1. Tên model của bảng liên kết tới
2. field chính của bảng liên kết tới
3. field hiển thị ở ngoài

- VD. selectAssoc('Provider', 'id', 'name')

## Siêu phức tạp

### CHOOSE PERMISSION

```javascript
{
    name: 'name',
    label: 'Tên quyền',
    type: 'text',
    show: true,
    showForm: true,
    positionSidebar: false,
    ...choosePermission()
}
```

- Các thuộc tính và lưu ý đặt biệt:

1. chỉ cần thêm ...choosePermission()

- Lưu ý: không xóa các trường trong bảng mặc định

#### Cực khoai

```javascript
{
    name: 'manager_module_id',
    label: 'Module cha',
    type: 'selectParentAssoc',
    keyValue: 'id',
    keyLabel: 'name',
    keyChild: 'child',
    ...selectParentAssoc(
        'ManagerModule',
        'id',
        'name',
        'manager_module_id',
        NO_CHECK_LEVEL,
        [
            {
                model: 'Module',
                field: 'manager_module_id',
            },
            {
                model: 'ManagerModule',
                field: 'manager_module_id',
            },
        ]
    ),
    show: true,
    showForm: true,
    positionSidebar: false,
},
```

- Các thuộc tính và lưu ý đặt biệt:

1. keyValue: (string) - field chính lấy dữ liệu
2. keyLabel: (string) - field hiển thị ở ngoài
3. keyChild: (string) - ```Quan trọng``` dùng để phân cấp.

- Thêm ```javascript...selectParentAssoc``` thuộc tính này bao gồm

1. Tên model lấy dữ liệu
2. field chính của bảng liên kết tới
3. field hiển thị ở ngoài
4. field để render theo cấp
5. ``` Không bắt buộc ``` Nếu có ```text (BOOLEAN) Lấy dữ liệu trong constants/model``` thì sẽ kiểm tra và in ra cấp đúng để không bị select nhầm dẫn tới loop vô hạn.
6. ``` Không bắt buộc ``` Một mảng để kiểm tra những bảng liên quan khác sẽ có tên ```model``` và ```tên trường``` map với bảng hiện tại thường là kiểm tra với id của bảng hiện tại.