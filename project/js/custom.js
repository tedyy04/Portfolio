// JavaScript Document
         new WOW().init();
		 var typed = new Typed('.element', {
               	strings: ["Graphic Designer.", "HTML-CSS.","Wev Designer." ,"Apps Designer."],
       	 	typeSpeed:50,
        		backSpeed:50,
        		loop:true,
        		});
$('#banner').owlCarousel({
   	 loop:true,	// cho lap lại
	items:1,	// xuất hiện 1 ảnh thôi
	smartSpeed:1000,   	// tốc độ thay đổi ảnh
	autoplay:true,		// cho phép tự động chạy
    autoplayTimeout:5000,  // thời gian chờ khi chuyển ảnh khi chạy tự động
	nav:true,	// cho xuất hiện bộ nút tới lui 
	  })

$('#me').owlCarousel({
   	 loop:true,	// cho lap lại
	items:1,	// xuất hiện 1 ảnh thôi
	smartSpeed:1000,   	// tốc độ thay đổi ảnh
	autoplay:true,		// cho phép tự động chạy
    autoplayTimeout:5000,  // thời gian chờ khi chuyển ảnh khi chạy tự động
	nav:true,	// cho xuất hiện bộ nút tới lui 
	  })


$('#sp2').owlCarousel({
    loop:true,
    margin:10,
    nav:true,
    responsive:{
        0:{
            items:2
        },
        600:{
            items:3
        },
        1000:{
            items:4
        }
    }
})

$('#tes').owlCarousel({
    loop:true,
    margin:100,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:1
        },
        1000:{
            items:2
        }
    }
})

$("#counter").countMe(40,65);

