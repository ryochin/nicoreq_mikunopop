var progIDs = [
	"Msxml2.XMLHTTP.6.0",
	"Msxml2.XMLHTTP.5.0",
	"Msxml2.XMLHTTP.4.0",
	"Msxml2.XMLHTTP.3.0",
	"Msxml2.XMLHTTP",
	"Microsoft.XMLHTTP"
]; 
for(var i=0,l=progIDs.length; i<l; i++){
	try{
		new ActiveXObject(progIDs[i]);
		WScript.echo(progIDs[i]);
		WScript.quit();
	}catch(e){
		if(i==l-1){
			throw e;
		}
	}
}