import React from 'react'
import Banner from './Banner'
import TopSellers from './TopSellers'
import Recommened from './Recommened'
import News from './News'
import AllBooks from './AllBooks'

const Home = () => {
  return (
    <>
        <Banner/>
        <TopSellers/>
        <AllBooks/>
        <Recommened/>
        <News/>
    </>
  )
}

export default Home