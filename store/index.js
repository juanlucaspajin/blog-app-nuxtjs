import Vuex from 'vuex';
import axios from 'axios';
import Cookie from 'js-cookie';
import Cookies from 'js-cookie';

const createStore = () => {
    return new Vuex.Store({
        state: {
            loadedPosts: [],
            token: null
        },
        mutations: {
            setPosts(state, posts) {
                state.loadedPosts = posts
            },
            addPost(state, post) {
                state.loadedPosts.push(post)
            },
            editPost(state, editedPost) {
                const postIndex = state.loadedPosts.findIndex(post => post.id == editedPost.id);
                state.loadedPosts[postIndex] = editedPost;
            },
            setToken(state, token) {
                state.token = token
            },
            clearToken(state) {
                state.token = null
            }
        },
        actions: {
            nuxtServerInit(vuexContext, context) {
                // Ejemplo usando un modulo contribuido de Axios
                return context.app.$axios.$get('/posts.json')
                    .then(data => {
                        const postsArray = [];
                        for (const key in data) {
                            postsArray.push({ ...data[key] , id: key})
                        }
                        vuexContext.commit('setPosts', postsArray)
                    })
                    .catch(e => context.error(e))
            },
            addPost(vuexContext, post) {
                const createdPost = {
                    ...post, 
                    updatedDate: new Date()
                }
                return axios.post('https://nuxt-blog-75c27-default-rtdb.firebaseio.com/posts.json?auth=' + vuexContext.state.token, createdPost)
                .then(res => {
                    vuexContext.commit('addPost',{...createdPost, id: res.data.name})           
                })
                .catch(e => console.log(e))
            },
            editPost(vuexContext, editedPost) {
                return axios.put('https://nuxt-blog-75c27-default-rtdb.firebaseio.com/posts/' + editedPost.id + '.json?auth=' + vuexContext.state.token, editedPost)
                .then(res => {
                    vuexContext.commit('editPost', editedPost)   
                })
                .catch(e => console.log(e))
            },
            setPosts(vuexContext,posts){
                vuexContext.commit('setPosts', posts)
            },
            authenticateUser(vuexContext, authData) {
                let authUrl = ''
                if (!authData.isLogin) {
                    authUrl = process.env.fbSignupUrl
                } else {
                    authUrl = process.env.fbLoginUrl
                }
                return this.$axios.$post(authUrl + process.env.firebaseAPIKey,
                {
                    email: authData.email,
                    password: authData.password,
                    returnSecureToken: true
                })
                .then(res =>{
                    vuexContext.commit('setToken', res.idToken)
                    localStorage.setItem('token',res.idToken)
                    localStorage.setItem('tokenExpiration', new Date().getTime() + Number.parseInt(res.expiresIn) * 1000)
                    Cookie.set('jwt', res.idToken)
                    Cookie.set('expirationDate', new Date().getTime() + Number.parseInt(res.expiresIn) * 1000)

                    return this.$axios.$post(process.env.expressUrl + '/api/track-data', {data: 'Authenticated!'})
                })
                .catch(e => console.log(e))
            },
            initAuth(vuexContext, request) {
                let token;
                let expirationDate;
                if(request) {
                    if (!request.headers.cookie) {
                        return;
                    }
                    const jwtCookie = request.headers.cookie.split(';').find(c => c.trim().startsWith('jwt='));
                    expirationDate = request.headers.cookie.split(';').find(c => c.trim().startsWith('expirationDate=')).split('=')[1];
                    if (!jwtCookie) {
                        return;
                    }
                    token = jwtCookie.split('=')[1];
                } else {
                    token = localStorage.getItem('token')
                    expirationDate = localStorage.getItem('tokenExpiration')
                }

                if (new Date().getTime() > +expirationDate || !token) {
                    console.log('No token or invalid token');
                    vuexContext.dispatch('logout')
                    return;
                }
                vuexContext.commit('setToken', token)
            },
            logout(vuexContext) {
                vuexContext.commit('clearToken')
                Cookie.remove('jwt')
                Cookie.remove('expirationDate')
                if(process.client) {
                    localStorage.removeItem('token')
                    localStorage.removeItem('tokenExpiration')
                }
            }
        },
        getters: {
            loadedPosts(state) {
                return state.loadedPosts
            },
            isAuthenticated(state) {
                return state.token != null
            }
        }
    })
}

export default createStore