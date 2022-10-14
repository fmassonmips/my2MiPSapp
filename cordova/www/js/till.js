if(localStorage.getItem("LocalData") == null)
{
    var data = [];
    data = JSON.stringify(data);
    localStorage.setItem("LocalData", data);
}

function scan()
{
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            if(!result.cancelled)
            {
                if(result.format == "QR_CODE")
                {
                    navigator.notification.prompt("Please enter name of data",  function(input){
                        var name = input.input1;
                        var value = result.text;

                        var data = localStorage.getItem("LocalData");
                        console.log(data);
                        data = JSON.parse(data);
                        data[data.length] = [name, value];

                        localStorage.setItem("LocalData", JSON.stringify(data));

                        alert("Done");
                    });
                }
            }
        },
        function (error) {
            alert("Scanning failed: " + error);
        }
    );
}

/*TILL RELATED */

/*BUG IF PRODUCT ALREADY IN THE CART NEED TO FIX */
function add_item_to_cart(item,id) {

    var sum = 0;
    var item_qty = 0;
    console.log(parseFloat($('#' + item).attr('price')) + ' * ' + parseInt($('#step_qty_' + id).val()) + ' = '
        + parseFloat($('#' + item).attr('price'))  *  parseInt($('#step_qty_' + id).val()));

    var html_item = '<li id="cart-item-'+id+'" class="cart-item">'+
        '<div class="item-content">'+
        '        <div class="item-inner">'+
        '           <div class="item-title-row">'+
        '                <div class="item-title">'+ $('#' + item).attr('title') +' x ' +  $('#step_qty_' + id).val() + '</div>'+
        '            </div>'+
        '            <div class="item-subtitle store-item" data-item="'+ $('#' + item).attr('title') +'" data-pid="' + id +'" pid="' + id +'" data-price="'+ $('#' + item).attr('price') +'" price="'+ $('#' + item).attr('price') +'">Rs. '+ (parseInt($('#' + item).attr('price')) * parseInt($('#step_qty_' + id).val())) +'</div>'+
        '        </div>'+
        '        <div class="item-media"><i class="icon f7-icons size-18 color-red" onclick="remove_cart_item('+id+')">trash</i></div>'+
        '    </div>'+
        '</li>';
    $('#poscart').append(html_item);
    $('.total_price').html(0);

    $('.store-item').each(function() {
        sum += parseFloat($(this).attr('price')) * parseInt($('#step_qty_' + $(this).attr('pid')).val());//Number($(this).attr('price'));
        console.log('SUM ' + sum + ' = Price : ' + parseFloat($(this).attr('price')) + ' x Qty : ' + parseInt($('#step_qty_' + $(this).attr('pid')).val()) +
        ' id : ' + id + ' Pid: ' + $(this).attr('pid') + ' item: ' + $(this).attr('id') );
        item_qty = item_qty + parseInt($('#step_qty_' + $(this).attr('pid')).val());
    });
    console.log('AFTER SUM ' + sum);

    $('.total_price').html('Rs. '+parseFloat(sum).toFixed(2));
    $('#totalcartprice').val(parseFloat(sum).toFixed(2));
    $('.cart-floating-button-title').html('CART (' + item_qty + ')');
    //$('#qrcodefield').focus();
}

function remove_cart_item(id) {
    var sum = 0;
    $('#cart-item-'+id).remove();
    $('.total_price').html(0);
    $('.store-item').each(function() {
        sum += parseFloat($(this).attr('price')) * parseInt($('#step_qty_' + $(this).attr('pid')).val());//Number($(this).attr('price'));
        console.log('SUM ' + sum + ' = Price : ' + parseFloat($(this).attr('price')) + ' x Qty : ' + parseInt($('#step_qty_' + $(this).attr('pid')).val()) +
            ' id : ' + id + ' Pid: ' + $(this).attr('pid') + ' item: ' + $(this).attr('id') );
    });
    $('.total_price').html('Rs. '+parseFloat(sum).toFixed(2));
    $('#totalcartprice').val(parseFloat(sum).toFixed(2));
    $('#qrcodefield').focus();
}

function getTillProductCategories(){
    var formData = new FormData();
    console.log('getTillProductCategories');
    formData.append('ref', 'get_till_products_cat');
    formData.append('id_category', $('#id_category').val());

    app.request({
        crossDomain: true,
        method: 'POST',
        url: mymipsURL+'mips-app/get-till-products-categories.php',
        data: formData,
        dataType: 'json',
        success: function(data) {
            var cat_html_div = '';

            jQuery.each(data, function (index, value) {
                cat_html_div += '<div class="swiper-slide text-align-center active">\n' +
                    '                                <!-- add active class when item category need active need to show -->\n' +
                    '                                <div class="card elevation-2 margin-bottom-half">\n' +
                    '                                    <div class="card-content-offer card-content-padding" id="cat-' + value.id_category + '" onclick="$(\'#id_category\').val(' + value.id_category + ');getTillProducts()">\n' +
                    '                                        <div>\n' +
                    '                                            <i class="icon f7-icons"><img src="'+mymipsURL+'Core_images/mymipsminitill/' + value.icon_img + '"></i>\n' +
                    '                                        </div>\n' +
                    '                                    </div>\n' +
                    '                                </div>\n' +
                    '                                <p class="small">' + value.catname + '</p>\n' +
                    '                            </div>';

            });
            if ($('#id_category').val() != '')
            {
                cat_html_div += '<div class="swiper-slide text-align-center active">\n' +
                    '                                <!-- add active class when item category need active need to show -->\n' +
                    '                                <div class="card elevation-2 margin-bottom-half">\n' +
                    '                                    <div class="card-content-offer card-content-padding" id="cat-0" onclick="$(\'#id_category\').val(\'\');getTillProducts()">\n' +
                    '                                        <div>\n' +
                    '                                            <i class="icon f7-icons"><img src="'+mymipsURL+'Core_images/mymipsminitill/other.png"></i>\n' +
                    '                                        </div>\n' +
                    '                                    </div>\n' +
                    '                                </div>\n' +
                    '                                <p class="small">ALL</p>\n' +
                    '                            </div>';
            }
            jQuery('#swiper-wrapper').html(cat_html_div);
        }

    });
}

function getTillProducts(){

    getTillProductCategories();
    $('#posProdList').html('');

    app.sheet.close('.payment-ticket-details');

    var formData = new FormData();
    formData.append('ref', 'get_till_products');
    formData.append('id_category', $('#id_category').val());
    app.request({
        crossDomain: true,
        method: 'POST',
        url: mymipsURL+'mips-app/get-till-products.php',
        data: formData,
        dataType: 'json',
        success: function(data) {
            //console.log(data);
            jQuery.each(data, function( index, value ) {
                //console.log(value);
                var car_items =
                    '<li>\n' +
                    '                            <div class="item-content">\n' +
                    '                                <div class="item-media">\n' +
                    '                                    <img src="'+mymipsURL+'Core_images/mymipsminitill/'+value.default_image+'" width="75" id="item-' + value.id_product +'" data-pid="' + value.id_product +'" pid="' + value.id_product +'" data-title="'+value.name+'" title="'+value.name+'" data-price="'+value.price+'" price="'+value.price+'"  onclick="add_item_to_cart(\'item-' + value.id_product +'\',' + value.id_product +')" class="store-item-icon-sku-' + value.sku +'"/>\n' +
                    '                                </div>\n' +
                    '                                <div class="item-inner">\n' +
                    '                                    <div class="item-title-row">\n' +
                    '                                        <div class="item-title">'+value.name+'</div>\n' +
                    '                                        <div class="item-after">Desc:'+value.description+'</div>\n' +
                    '                                    </div>\n' +
                    '                                    <div class="item-subtitle">Price: Rs. '+value.price+'\n</div>\n' +
                    '                                    <div class="stepper stepper-init">\n' +
                    '                                        <div class="stepper-button-minus" data-id="item-' + value.id_product +'" onclick="console.log(\'Stepper minus value click\');step_minus(' + value.id_product +');"></div>\n' +
                    '                                        <div class="stepper-input-wrap">\n' +
                    '                                            <input id="step_qty_' + value.id_product +'" data-id="item-' + value.id_product +'" type="text" value="1" min="1" max="100" step="1" readonly />\n' +
                    '                                        </div>\n' +
                    '                                        <div class="stepper-button-plus" data-id="item-' + value.id_product +'" onclick="console.log(\'Stepper value click\');step_plus(' + value.id_product +');"></div>\n' +
                    '                                    </div>\n' +
                    //'                                    <div class="item-text"><a href="#" class="col button button-fill store-item-icon" id="item-' + value.id_product +'" data-title="'+value.name+'" title="'+value.name+'" data-price="'+value.price+'" price="'+value.price+'" onclick="add_item_to_cart(\'item-' + value.id_product +'\',' + value.id_product +')" data-sku="' + value.sku +'">ADD</a></div>\n' +
                    '                                </div>\n' +
                    '                            </div>\n' +
                    '                        </li>';
                $('#posProdList').append(car_items);
                //console.log(car_items);
                //console.log('->' + value.id_product + '-> ' + value.name + ' [' + value.catname + '] => ' + value.price + ' img: ' + value.default_image);
            });
        }

    });

    $(document).on('keypress',function(e) {
        if(e.which == 13) {
            //alert('You pressed enter!' + $('#qrcodefield').val());
            $('.store-item-icon-sku-' + $('#qrcodefield').val()).click();
            $('#qrcodefield').val('');
           // $('#qrcodefield').focus();
        }
    });

    $('#qrcodefield').on('change', function(event){
        alert('You pressed enter new sku!');

    });

    if($('#qrcodefield').length) {
        //$('#qrcodefield').focus()
    }
    /*setTimeout(
        $('#qrcodefield').focus(), 2500);*/

    $('.card-content').on('click', function(e){
        e.preventDefault();
        console.log($(this));
    });
}

function step_minus(id){
    console.log('ITEM ' + id + ' -> ' + $('#step_qty_' + id).val());
    if($('#step_qty_' + id).val() > 0 )
        $('#step_qty_' + id).val(parseInt($('#step_qty_' + id).val())-1);
}
function step_plus(id){
    console.log('ITEM ' + id + ' -> ' + $('#step_qty_' + id).val());
    $('#step_qty_' + id).val(parseInt($('#step_qty_' + id).val())+1);
}

function update_payment_amount(){

    console.log(parseFloat($('#totalcartprice').val()).toFixed(2));
    //$('.idp-phone-block').show();
    $('#amount_to_pay').val(parseFloat($('#totalcartprice').val()).toFixed(2));


}

var stepper = app.stepper.create({
    el: '.stepper',
    on: {
        change: function () {
            console.log('Stepper value changed')
        }
    }
});


var $$ = Dom7;

// Option 2. Using live 'page:init' event handlers for each page (not recommended)
$$(document).on('page:init', '.page[data-page="till"]', function (e) {
    // Do something here when page with data-page="about" attribute loaded and initialized
    console.log('PAGE TILL');
})

$$(document).on('page:init', function (e) {
    // Page Data contains all required information about loaded and initialized page

    var page = e.detail;
    console.log(e);


    /* swiper carousel categories */
    var swiper1 = app.swiper.create(".swipercategory", {
        slidesPerView: "auto",
        spaceBetween: 0,
        pagination: false
    });

    


})

$$(document).on('page:init', '.page[data-name="till"]', function (e) {
    // Do something here when page with data-page="about" attribute loaded and initialized
    console.log('PAGE TILL LOADED, LOADING PRODUCTS !!!');
    getTillProducts();
})

/***********************/
/* MiPS Mini till End  */
/***********************/