## 1. Giới thiệu
[Bigtree](https://www.bigtreecms.org/) là một CMS mã nguồn mở được phát triển bởi  [Fastspot](http://www.fastspot.com/). Đây được đánh giá là một trong 50 CMS tốt nhất theo đánh giá của [Website Magazine](https://www.websitemagazine.com/). Phiên bản hiện tại của CMS này đã có trên 26000 lượt tải cùng với 1 forum với khoảng 800 active user hoạt động. Hiện nay, có trên 2000 trang đang sử dụng CMS này. 

Đây là một CMS viết trên mã nguồn PHP và sử dụng database là MySQL. Trong lúc đi tìm bug dạo với các mã nguồn PHP, mình tình cờ gặp và thấy hứng thú với CMS này. Theo đó, mình thấy có vài lỗ  hổng khá hay ho trong này, mọi người cùng mình tìm hiểu nhé
## 2. Cài đặt

##### Tạo cơ sở dữ liệu **bigtree**

```sql
CREATE DATABASE bigtree;
```

##### Tạo một user database
```sql
CREATE USER 'bigtree'@'localhost' IDENTIFIED BY 'password';
```
##### Sau đó cấp quyền cho người dùng truy cập vào cơ sở dữ liệu
```sql
GRANT ALL ON bigtree.* TO 'bigtree'@'localhost' IDENTIFIED BY 'password' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```
##### Dowload và cài đặt BigTree CMS
```bash
wget https://www.bigtreecms.org/ajax/download-installer/\?installer\=81\&email\= -O bigtree.zip
unzip bigtree.zip
sudo mv BigTree-CMS /var/www/html/bigtree
sudo chown -R www-data:www-data /var/www/html/bigtree
```
## 3. Exploit

BigTree gặp phải một SQL injection có thể khai thai được trong chức năng Add Feed của Developer. Ở đây Developer có thể thêm một *Feed* lên hệ thống. Tuy nhiên việc xử lý các param không được thực hiện ở backend nên chúng ta có thể tiêm các payload sql injection để tấn công website. Dưới đây là đoạn code xử lý chức năng này:

![](https://images.viblo.asia/0bf6841c-1b7f-4c6a-acfc-bb38adf7f0a2.png)

Vì BigTree đã sử dụng CSRF token nên không thể khai thác thông qua lỗ hổng CSRF. Ở dòng 6 và dòng 8 là 2 câu truy vấn thông qua các tham số như **$feed['table']**,  **$sort**, hoặc **$limit**. Các tham số này hoàn toàn không được bảo vệ dẫn đến có thể inject được các câu truy vấn vào database.

Thử debug và inject xem sao, đầu tiên sử dụng chức năng Add Feed trên web:
![](https://images.viblo.asia/4cb34735-483d-4b01-be3b-9648e302f186.png)

Sau khi tạo xong sẽ nhận được 1 link:

![](https://images.viblo.asia/f36df7ab-25f6-4680-bdac-43c470ec98dd.png)

Truy cập vào thì có vẻ như gặp lỗi

![](https://images.viblo.asia/6c39e092-3186-4cb0-814e-61f67793a631.png)

Mình thử debug bằng việc in ra câu truy vấn và capture request xem có thể inject được hay không.
Bắt request thấy param **table** được gửi lên từ phía client. Thêm dấu nháy đơn vào value param **table** và gửi request thì vẫn có thể tạo được một feed mới. 

![](https://images.viblo.asia/b5a97c53-5515-4535-a4ea-fa6030ec889e.png)

![](https://images.viblo.asia/e303fc03-86c6-4d49-b0cb-b3e316535ba9.png)


Sau khi truy cập đường link để xem query mình vừa in ra xem như nào

![](https://images.viblo.asia/58424394-6aa3-4944-a0e4-023ca9ac3637.png)

Quả nhiên query đã nhận dấu nháy của mình, vậy nên hoàn toàn có thể khẳng định param **table** có thể control từ phía client. Giờ thì sql injection trở nên dễ dàng hơn nhiều rồi phải không? Thử một payload time based xem kết quả như nào.

![](https://images.viblo.asia/bbb85d67-30b7-47e9-9937-5a08ce9a7692.png)

Vẫn tạo thành công và nhận được một link truy cập vào Feed đó.

![](https://images.viblo.asia/00508570-76e0-4b09-963a-51bcf37d999b.png)

Truy cập vào link Feed vừa nhận được xem payload time based của mình có nhận hay không.
![](https://images.viblo.asia/44899b6a-c1fa-4d8c-be4b-81fb6e37a69c.png)

Và kết quả **sleep(5)** của mình đã inject và có thể khẳng định CMS này đã bị dính SQL injection
![](https://images.viblo.asia/a4c6800e-170f-4ac9-bcd3-68cc454f404b.png)


###