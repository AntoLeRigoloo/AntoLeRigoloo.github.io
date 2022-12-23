let menu = document.getElementById("menu");

function onWindowResize() {
    if (window.innerWidth > 769){
        menu.style.top = "-100%";
        menu.style.opacity = "0";
    }
}
window.addEventListener('resize', onWindowResize, false);


function ToggleHamburger(){

    if (menu.style.top == "0px"){
        menu.style.top = "-100%";
        menu.style.opacity = "0";
    }
    else {
        menu.style.top = "0px";
        menu.style.opacity = "1";
    }

}