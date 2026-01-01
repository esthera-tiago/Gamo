const toggleButton =  document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')

function toggleSideBar() {
    sidebar.classList.toggle('close')
    toggleButton.classList.toggle('rotate')
    Array.from(document.getElementsByClassName('open')).forEach(ul => {
        ul.classList.remove('open')
        ul.previousElementSibling.classList.remove('rotate')
    })
}

document.addEventListener('DOMContentLoaded', () => {
    const heading = document.querySelector('main p');
    if (heading) {
        // delay (ms) before starting the fill animation
        const delay = 1200;
        setTimeout(() => heading.classList.add('filled'), delay);
    }
});

function toggleSubMenu(button) {
    button.nextElementSibling.classList.toggle('open')
    button.classList.toggle('rotate')

    if(sidebar.classList.contains('close')){
        sidebar.classList.toggle('close')
        toggleButton.classList.toggle('rotate')
    }
}