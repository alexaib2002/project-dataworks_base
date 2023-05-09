import Router from 'next/router';

function changePage(page: string) {
	Router.push(page);
}

export default changePage;