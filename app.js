var express = require('express'); 
var app = express();

// view로 활용될 폴더 경로를 설정합니다. 
app.set( 'views' , '${ __dirname }/dist/' ); 
app.engine('html', require('ejs').renderFile); 
app.set( 'view engine', 'html'); 

// 웹사이트의 location 의 루트경로를 설정합니다. 
app.use( '/' , express.static( `${ __dirname }/dist/` )); 

app.get( '/' , ( req , res ) => { 
    res.render( 'index' , {}) ; 
}); 

var server = app.listen( 8005, () => { 
    console.log( 'Express listening on port : ' + server.address().port );
});
