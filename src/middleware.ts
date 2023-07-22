import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
	try {
		// if (!request.cookies.has('tokend'))
		// 	return NextResponse.redirect(new URL('/user/login', request.url))
		let cookie = request.cookies.get('tokend')?.value
		const response = await fetch("https://poslix2.onrender.com/api/getinfo", { //https://poslix.onrender.com/api/getinfo
			method: 'Post',
			headers: {
				'content-type': 'application/json',
				'authorization': "Bearer " + cookie,
			}, body: JSON.stringify({ fetch: 'checkwt' })
		})
		const resJwt = await response.json();
		// if (!resJwt.success) {
		// 	return NextResponse.redirect(new URL('/user/login', request.url))
		// }
		return NextResponse.next()
	} catch (err: any) {
		console.log("inja mid error: ", err);
		console.error(err)
		return NextResponse.error();
	}
}

export const config = {
	matcher: '/shop/:path*',
}
