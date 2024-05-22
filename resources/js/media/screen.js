import request from '../utils/request';
import { refreshItemEvent } from './selecting';
import { listItem } from './selector'
import { eventLoadItem } from './upload';
import { eventAddAllAction } from './item';
function screen() {
    let page = new URLSearchParams(window.location.search).get('page') ?? 1;
    let loadData = false;
    let observer = new IntersectionObserver(intersectionCallback);
    async function intersectionCallback(entries) {
        for (const entry of entries) {
            if (entry.isIntersecting && !loadData) {
                page++;
                loadData = true;
                const { pathname } = window.location;
                request.setParam('page', page);
                request.setParam('isJson', 1);
                observer.disconnect();
                try {
                    const res = await request.get(pathname);
                    if (res.data && res.data.rows && res.data.rows.length) {
                        eventLoadItem.items = res.data.rows;
                        window.dispatchEvent(eventLoadItem);
                        lastItem = listItem.children[listItem.children.length - 1];
                        observer.observe(lastItem);
                        loadData = false;
                        window.dispatchEvent(refreshItemEvent);
                        window.dispatchEvent(eventAddAllAction);
                    }
                } catch (e) {
                    console.log(e.message);
                }
            }
        }
    };

    let lastItem = listItem.children[listItem.children.length - 1];
    if (lastItem) {
        observer.observe(lastItem);
    }
}

export default screen;