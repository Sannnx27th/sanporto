$(document).ready(function() {

    // --- 1. FUNGSI LOAD HALAMAN (SPA) ---
function loadPage(pageName) {
    const contentDiv = $('#content');
    const v = new Date().getTime();

    // 1. Buat kontainer transparan dulu agar tidak 'lompat'
    contentDiv.stop(true, true).fadeOut(200, function() {
        $.get(pageName + '.html?v=' + v, function(data) {
            
            // 2. Masukkan data tapi sembunyikan dulu
            contentDiv.html(data).css({
                'display': 'none',
                'opacity': 0
            });

            // 3. Munculkan perlahan tanpa efek slide (biar gak fliker)
            contentDiv.show().animate({
                opacity: 1
            }, 400);

        }).fail(function() {
            contentDiv.html('<div style="text-align:center; padding:50px;"><h2>File Tidak Ditemukan</h2></div>').fadeIn(300);
        });
    });
}

    // --- 2. LOGIKA REFRESH (URL HASH) ---
    let hash = window.location.hash.substring(1);
    if (hash) {
        loadPage(hash);
        $('nav ul li a').removeClass('active');
        $(`nav ul li a[data-page="${hash}"]`).addClass('active');
    } else {
        loadPage('home');
    }

    // --- 3. EVENT KLIK NAVIGASI ---
    $(document).on('click', 'nav ul li a', function(e) {
        const page = $(this).data('page');
        if(page) {
            e.preventDefault();
            window.location.hash = page; // Update URL bar
            $('nav ul li a').removeClass('active');
            $(this).addClass('active');
            loadPage(page);
        }
    });

    function loadSavedFormData() {
        const savedData = localStorage.getItem('contactFormData');
        if (savedData) {
            const data = JSON.parse(savedData);
            $('#name').val(data.name || '');
            $('#email').val(data.email || '');
            $('#message').val(data.message || '');
        }
    }

    // Simpan data ke storage setiap kali user mengetik
    $(document).on('input', '.form-input', function() {
        const formData = {
            name: $('#name').val(),
            email: $('#email').val(),
            message: $('#message').val()
        };
        localStorage.setItem('contactFormData', JSON.stringify(formData));
    });

    // Cek setiap kali AJAX selesai (karena form contact muncul lewat AJAX)
    $(document).ajaxComplete(function(event, xhr, settings) {
        if (settings.url.includes('contact.html')) {
            loadSavedFormData();
        }
    });

    // --- 5. VALIDASI & SUBMIT FORM ---
    $(document).on('submit', '#contact-form', function(e) {
        e.preventDefault();
        $('.error-msg').text('').css('color', 'red');
        $('.form-input').css('border-color', '#eee');

        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const message = $('#message').val() ? $('#message').val().trim() : "";
        const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let error = false;

        if (name === "") {
            $('#name-error').text('Nama wajib diisi');
            $('#name').css('border-color', 'red');
            error = true;
        }
        if (!emailReg.test(email)) {
            $('#email-error').text('Email tidak valid');
            $('#email').css('border-color', 'red');
            error = true;
        }
        if ($('#message').length > 0 && message.length < 5) {
            $('#message-error').text('Pesan minimal 5 karakter');
            $('#message').css('border-color', 'red');
            error = true;
        }

        if (!error) {
            const btn = $(this).find('button');
            btn.text('Sending...').prop('disabled', true);
            
            setTimeout(() => {
                $('#success-toast').fadeIn();
                
                // Hapus data dari storage setelah berhasil dikirim
                localStorage.removeItem('contactFormData'); 
                
                $(this)[0].reset();
                btn.text('Send Message').prop('disabled', false);
                setTimeout(() => $('#success-toast').fadeOut(), 3000);
            }, 1500);
        }
    });
});