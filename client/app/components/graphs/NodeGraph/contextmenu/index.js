import './styles.scss'
import { select as d3Select, selectAll as d3SelectAll } from 'd3-selection'
import { event as currentEvent, mouse as currentMouse } from 'd3-selection';

export default function contextMenu(menu, opts) {
    var openCallback,
        closeCallback;

    if (typeof opts === 'function') {
        openCallback = opts;
    } else {
        opts = opts || {};
        openCallback = opts.onOpen;
        closeCallback = opts.onClose;
    }

    // create the div element that will hold the context menu
    d3SelectAll('.d3-context-menu').data([1])
        .enter()
        .append('div')
        .attr('class', 'd3-context-menu');

    // close menu
    d3Select('body').on('click.d3-context-menu', function() {
        d3Select('.d3-context-menu').style('display', 'none');
        if (closeCallback) {
            closeCallback();
        }
    });

    // this gets executed when a contextmenu event occurs
    return function(data, index) {
        var elm = this;

        d3SelectAll('.d3-context-menu').html('');
        var list = d3SelectAll('.d3-context-menu')
            .on('contextmenu', function(d) {
                d3Select('.d3-context-menu').style('display', 'none'); 
                currentEvent.preventDefault();
                currentEvent.stopPropagation();
            })
            .append('ul');
        list.selectAll('li').data(typeof menu === 'function' ? menu(data) : menu).enter()
            .append('li')
            .attr('class', function(d) {
                var ret = '';
                if (d.divider) {
                    ret += ' is-divider';
                }
                if (d.disabled) {
                    ret += ' is-disabled';
                }
                if (!d.action) {
                    ret += ' is-header';
                }
                return ret;
            })
            .html(function(d) {
                if (d.divider) {
                    return '<hr>';
                }
                if (!d.title) {
                    console.error('No title attribute set. Check the spelling of your options.');
                }
                return (typeof d.title === 'string') ? d.title : d.title(data);
            })
            .on('click', function(d, i) {
                if (d.disabled) return; // do nothing if disabled
                if (!d.action) return; // headers have no "action"
                d.action(elm, data, index);
                d3Select('.d3-context-menu').style('display', 'none');

                if (closeCallback) {
                    closeCallback();
                }
            });

        // the openCallback allows an action to fire before the menu is displayed
        // an example usage would be closing a tooltip
        if (openCallback) {
            if (openCallback(data, index) === false) {
                return;
            }
        }

        // display context menu
        d3Select('.d3-context-menu')
            .style('left', (currentEvent.pageX - 2) + 'px')
            .style('top', (currentEvent.pageY - 2) + 'px')
            .style('display', 'block');

        currentEvent.preventDefault();
        currentEvent.stopPropagation();
    };
}
