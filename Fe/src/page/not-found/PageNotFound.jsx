import { Group, Text } from '@mantine/core'

function PageNotFound() {
  return (
    <Group h={'100vh'} w={'100%'} justify="center" align="center">
      <Text size="100px" c={'gray'} fw={'bold'}>
        404
      </Text>
      <Text>Page not found</Text>
    </Group>
  )
}

export default PageNotFound
