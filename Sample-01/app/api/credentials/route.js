import { NextResponse } from 'next/server';
import { auth0 } from '../../../lib/auth0';
import path from 'path';

export const GET = async function credentials() {
  try {
    const session = await auth0.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const res = new NextResponse();

    const tokenRes = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: process.env.AUTH0_AUDIENCE,
        grant_type: 'client_credentials',
      }),
    });


    const { access_token } = await tokenRes.json();

    const response = await fetch(
      path.join(process.env.AUTH0_AUDIENCE, `/users/${session.user.sub}/authentication-methods`),
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const credentials = await response.json();

    return NextResponse.json(credentials[0], res);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
};
