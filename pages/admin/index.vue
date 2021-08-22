<template>
    <div class="admin-page">
        <section class="new-post">
            <AppButton @click="$router.push('/admin/new-post')">Create post</AppButton>
            <AppButton @click="onLogout">Logout</AppButton>
        </section>
        <section class="existing-posts">
            <h1>Existing posts</h1>
            <PostList isAdmin :posts="loadedPosts" />
        </section>
    </div>
</template>

<script>

import axios from 'axios'

export default {
    layout: 'admin',
    middleware: ['check-auth','auth'],
    computed: {
      loadedPosts() {
        return this.$store.getters.loadedPosts;
      }
    },
    methods: {
      onLogout() {
        this.$store.dispatch('logout');
        this.$router.push('/admin/auth')
      }
    }
    // asyncData(context) {
    //   return axios.get('https://nuxt-blog-75c27-default-rtdb.firebaseio.com/posts.json')
    //     .then(res => {
    //       let postsArray = []
    //       for (const key in res.data) {
    //         postsArray.push({...res.data[key], id: key})
    //       }
    //       return {
    //         loadedPosts: postsArray
    //       }
    //     })
    //     .catch(e => context.error(e))
    // }
}
</script>

<style scoped>
.admin-page {
  padding: 20px;
}

.new-post {
  text-align: center;
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
}

.existing-posts h1 {
  text-align: center;
}
</style>

