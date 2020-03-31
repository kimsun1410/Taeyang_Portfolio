var gulp = require('gulp'); 
var scss = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var base64 = require('gulp-base64-v2');
var sourcemaps = require('gulp-sourcemaps');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify'); 
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var del = require('del');

// 소스 파일 경로 
var PATH = { 
    HTML: './public/html',
    ASSETS: { 
        FONTS: './public/assets/fonts' ,
        IMAGES: './public/assets/image' ,
        IMAGESUB: './public/assets/image/projects' ,
        STYLE: './public/assets/scss' ,
        SCRIPT: './public/assets/js' ,
        LIB: './public/assets/lib'
    } 
}, 
// 산출물 경로 
DEST_PATH = {
    HTML: './dist',
    ASSETS: { 
        FONTS: './dist/common/fonts' ,
        IMAGES: './dist/common/image' ,
        IMAGESUB: './dist/common/image/projects' , 
        STYLE: './dist/common/css' ,
        SCRIPT: './dist/common/js' ,
        LIB: './dist/common/lib'
    } 
};

gulp.task('clean', () => { 
    return new Promise( resolve => { 
        del.sync(DEST_PATH.HTML);
        
        resolve();
    }); 
});

gulp.task( 'fonts', () => { 
    return new Promise( resolve => { 
        gulp.src( PATH.ASSETS.FONTS + '/*.*') 
        .pipe( gulp.dest( DEST_PATH.ASSETS.FONTS )); 
        resolve(); 
    }); 
});

gulp.task( 'scss:compile', () => {
    return new Promise( resolve => { 
        var options = { 
            outputStyle: "compressed"
            , indentType: "space"
            , indentWidth: 1
            , precision: 6 , 
            sourceComments: false 
        }; 
        
        gulp.src( [PATH.ASSETS.STYLE + '/*.scss', PATH.ASSETS.STYLE + '/layouts/*.scss'])
            .pipe(concat('style.css') ) 
            .pipe(base64({
                baseDir: './dist/common/css',
                extensions: ['svg', 'png', /\.jpg#datauri$/i],
                exclude:    [/\.server\.(com|net)\/dynamic\//, '--live.jpg'],
                maxImageSize: 8*1024, // bytes,
                deleteAfterEncoding: false,
                debug: true
            }))
            .pipe(sassGlob())
            .pipe( sourcemaps.init() ) 
            .pipe( scss(options) )
            .pipe( gulp.dest( DEST_PATH.ASSETS.STYLE ) ); 
        
        resolve(); 
    }); 
});

gulp.task( 'html', () => { 
    return new Promise( resolve => { 
        gulp.src( PATH.HTML + '/*.html' ) 
            .pipe( gulp.dest( DEST_PATH.HTML ) ); 
        resolve(); 
    });
});


gulp.task( 'subimg', () => { 
    return new Promise( resolve => { 
        gulp.src( PATH.ASSETS.IMAGESUB + '/*.*' )
            .pipe( imagemin([ 
                imagemin.gifsicle({interlaced: false}), 
                imagemin.mozjpeg({quality: 75, progressive: true}), 
                imagemin.optipng({optimizationLevel: 5}), 
                imagemin.svgo({ 
                    plugins: [ 
                        {removeViewBox: true}, 
                        {cleanupIDs: false} 
                    ] 
                }) 
            ])) 
            .pipe( gulp.dest( DEST_PATH.ASSETS.IMAGESUB ) ); 
        resolve(); 
    });
});

gulp.task( 'imagemin', () => { 
    return new Promise( resolve => { 
        gulp.src( PATH.ASSETS.IMAGES + '/*.*') 
            .pipe( imagemin([ 
                imagemin.gifsicle({interlaced: false}), 
                imagemin.mozjpeg({quality: 75, progressive: true}), 
                imagemin.optipng({optimizationLevel: 5}), 
                imagemin.svgo({ 
                    plugins: [ 
                        {removeViewBox: true}, 
                        {cleanupIDs: false} 
                    ] 
                }) 
            ])) 
            .pipe( gulp.dest( DEST_PATH.ASSETS.IMAGES ) )
            .pipe( browserSync.reload({stream: true}) );
        resolve(); 
    }); 
});



gulp.task( 'script:build', () => { 
    return new Promise( resolve => { 
        gulp.src( PATH.ASSETS.SCRIPT + '/*.js') 
            .pipe( concat('common.js') ) 
            .pipe( uglify({ 
                mangle: true // 알파벳 한글자 압축 
            })) 
            .pipe( rename('common.min.js') ) 
            .pipe( gulp.dest( DEST_PATH.ASSETS.SCRIPT ) ) 
            .pipe( browserSync.reload({stream: true}) ); 
        resolve(); 
    }) 
});

gulp.task( 'library', () => { 
    return new Promise( resolve => { 
        gulp.src( PATH.ASSETS.LIB + '/*.js') 
            .pipe( uglify({ 
                mangle: true // 알파벳 한글자 압축 
            }))
            .pipe( gulp.dest( DEST_PATH.ASSETS.LIB ))
        resolve(); 
    }); 
});


gulp.task( 'nodemon:start', () => { 
    return new Promise( resolve => { 
        nodemon({ 
            script: 'app.js' 
            , watch: 'app' 
        }); 
        resolve(); 
    }); 
});

gulp.task('watch', () => { 
    return new Promise( resolve => { 
        gulp.watch(PATH.HTML + "/**/*.html", gulp.series(['html'])); 
        gulp.watch(PATH.ASSETS.STYLE + "/**/*.scss", gulp.series(['scss:compile'])); 
        gulp.watch(PATH.ASSETS.SCRIPT + "/**/*.js", gulp.series(['script:build']));
        gulp.watch(PATH.ASSETS.IMAGES + "/**/*.*", gulp.series(['imagemin']));
        
        resolve(); 
    }); 
});


gulp.task('browserSync', () => { 
    return new Promise( resolve => {
        browserSync.init( null, { 
            proxy: 'http://localhost:8005' 
            , port: 8006 
        }); 
        resolve(); 
    }); 
});

var allSeries = gulp.series([ 
    'clean'
    , 'fonts'
    , 'scss:compile' 
    , 'html' 
    , 'script:build'
    , 'subimg'
    , 'imagemin' 
    , 'library'
    , 'nodemon:start' 
    , 'browserSync'
    , 'watch'
]);

gulp.task( 'default', allSeries);
