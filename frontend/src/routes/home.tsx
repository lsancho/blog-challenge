import { Card, CardBody } from '@nextui-org/react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useLoaderData } from 'react-router-typesafe'

type Post = {
  version: number
  id: string
  created_at: string
  content: string
  title: string
  image_url: string
  user_id: string
  views: number
  likes: number
  dislikes: number
  updated_at: string
}

export async function loader() {
  if (!axios.defaults.headers.common['Authorization']) return { posts: [] } // not logged in

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const response = await axios.get(API_BASE_URL + '/post')
  const posts = response.data as Post[]
  return { posts }
}

type PostProps = {
  id: string
  title: string
  content: string
  image_url: string
}
function Post(props: PostProps) {
  return (
    <Link to={`/post/${props.id}`}>
      <div className='mx-5 max-w-[700px] '>
        <h2 className='text-2xl font-bold'>{props.title}</h2>
        <div className=' overflow-hidden '>
          {props.image_url && (
            <img className='h-48 w-11/12 object-cover' src={props.image_url} alt={`Image for ${props.title}`} />
          )}
        </div>
      </div>
    </Link>
  )
  // return (
  //   <div className='group cursor-pointer'>
  //     <div className=' overflow-hidden rounded-md bg-gray-100 transition-all hover:scale-105   dark:bg-gray-800'>
  //       <a
  //         className='relative block aspect-video'
  //         href='/post/architectural-engineering-wonders-of-the-modern-era-for-your-inspiration'
  //       >
  //         <img
  //           alt='Thumbnail'
  //           decoding='async'
  //           data-nimg='fill'
  //           className='object-cover transition-all'
  //           sizes='(max-width: 768px) 30vw, 33vw'
  //         ></img>
  //       </a>
  //       <div className=''>
  //         <div className='flex gap-3'>
  //           <h2 className='mt-2 text-lg font-semibold leading-snug tracking-tight    dark:text-white'>
  //             <a href='/post/architectural-engineering-wonders-of-the-modern-era-for-your-inspiration'>aasdas </a>
  //           </h2>
  //         </div>
  //         <div className='mt-3 flex items-center space-x-3 text-gray-500 dark:text-gray-400'>
  //           <a href='/author/mario-sanchez'>
  //             <div className='flex items-center gap-3'>
  //               <div className='relative h-5 w-5 flex-shrink-0'></div>
  //               <span className='truncate text-sm'>Mario Sanchez</span>
  //             </div>
  //           </a>
  //           <span className='text-xs text-gray-300 dark:text-gray-600'>•</span>
  //           <time className='truncate text-sm' datetime='2022-10-21T15:48:00.000Z'>
  //             October 21, 2022
  //           </time>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // )
}

function Page() {
  const { posts } = useLoaderData<typeof loader>()

  return (
    <section className='flex justify-center'>
      <Card className='h-full w-[680px] max-w-full'>
        <CardBody className='overflow-hidden'>
          {posts && posts.length > 0 ? (
            <ul>
              {posts.map((post) => (
                <li key={post.id}>
                  <Post {...post} />
                </li>
              ))}
            </ul>
          ) : null}
        </CardBody>
      </Card>
    </section>
  )

  return <></>
}

export default Page
