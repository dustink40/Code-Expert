import { /*Layout,*/ Text, Page } from '@vercel/examples-ui'
import { Chat } from '../components/Chat'

function Home() {
  return (
    <Page className="flex flex-col align-middle gap-12">
      <section className="flex flex-col text-center gap-6">
        <Text variant="h1">Welcome to a new era of contractor support</Text>
        <Text className="text-zinc-600 text-center ">
       CODE-EXPERT is Guttermade's Chat-GPT AI construction Assistant. he was built by Dustin Keith and Ryan Fortin to help people in building decks. In any capacity. he is construction focused, but capable of so much more. Go ahead and ask him anything, and start planning your project.
        </Text>
      </section>

      <section className="flex flex-col gap-3">
        <Text variant="h2">Chat with Code-Expert:</Text>
        <div className="lg:w-4/4">
          <Chat />
        </div>
      </section>
    </Page>
  )
}

//Home.Layout = Layout

export default Home
