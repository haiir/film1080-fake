/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Tabs } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faHeart } from "@fortawesome/free-regular-svg-icons";
import { useDispatch, useSelector } from "react-redux";

import styles from "./WatchMovie.module.css";
import { VideoJS } from "~/components/VideoJS";
import MoviesRecommend from "~/components/MoviesRecommend";
import { faClock, faComment } from "@fortawesome/free-regular-svg-icons";
import * as apiRequest from "~/apiRequest";
import MoviesItem from "~/components/MoviesItem";
import Loading from "~/components/Loading";
import { addMovieToListFollow, addMovieToListLike, addMovieToListWatched } from "~/redux/reducers/authSlice";
import { toast } from "react-toastify";

const cx = classNames.bind(styles);

const WatchMovie = () => {
  const [episodes, setEpisodes] = useState(null);
  const [currentEpisodeSrc, setCurrentEpisodeSrc] = useState(null);

  const { name_film } = useParams();
  const { episode } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const movieCurrent = useSelector((state) => state.movieCurrent);
  const moviesRecommend = useSelector((state) => state.moviesRecommend);
  const moviesNominated = useSelector((state) => state.moviesNominated);
  const user = useSelector((state) => state.auth.user);
  // call API
  useEffect(() => {
    apiRequest.getMovieCurrent(dispatch, name_film);
    apiRequest.getMoviesRecommend(dispatch);
    apiRequest.getMoviesNominated(dispatch);
  }, [name_film]);

  // scroll alway on top
  useEffect(() => {
    window.scroll(0, 0);
  }, [episode]);

  // get all episode when movieCurrent change data
  useEffect(() => {
    if (movieCurrent.data) {
      setEpisodes(movieCurrent.data.episodes[0].server_data);
      if (user) dispatch(addMovieToListWatched(movieCurrent.data));
    }
  }, [movieCurrent]);

  // convert param episode to get episode src
  useEffect(() => {
    if (episode === "full" && episodes) {
      setCurrentEpisodeSrc(episodes[0].link_m3u8);
    } else if (!isNaN(episode) && episodes && episode <= episodes.length) {
      setCurrentEpisodeSrc(movieCurrent.data.episodes[0].server_data[episode - 1].link_m3u8);
    }
  }, [episodes, episode]);

  //navigate episode when user click link movie(when haven't param'episode')(callback when episodes change va state movieCurrent in redux replace)
  useEffect(() => {
    if (!episode && episodes && movieCurrent.data.movie.slug === name_film) {
      if (episodes[0].slug === "full") navigate("/watch/" + name_film + "/full", { replace: true });
      else navigate("/watch/" + name_film + "/1", { replace: true });
    }
  }, [episodes]);

  const videoJsOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: movieCurrent.data && currentEpisodeSrc,
        type: "application/x-mpegURL",
      },
    ],
  };

  return (
    <>
      {movieCurrent.isFetch ? (
        <Loading />
      ) : (
        <section className={cx("watch-movie")}>
          <div className={cx("watch-movie__player")}>{currentEpisodeSrc && <VideoJS options={videoJsOptions} />}</div>
          <div className={cx("watch-movie__related")}>
            <ul className={cx("related__content")}>
              {moviesNominated.data &&
                moviesNominated.data.items
                  .slice(0, 10)
                  .map((movie, index) => (
                    <MoviesItem
                      key={index}
                      type={4}
                      isItemHot={false}
                      movie={movie}
                      pathImage={moviesNominated.data?.pathImage}
                    />
                  ))}
            </ul>
          </div>
          <div className={cx("watch-movie__info")}>
            <div className={cx("info-box__header")}>
              <h4 className={cx("info-header__title-vie")}>{movieCurrent.data && movieCurrent.data.movie.name}</h4>
              <div className={cx("wrap")}>
                <span className={cx("info-header__views")}>L?????t xem: {(Math.random() * 20 + 1).toFixed(1)}k xem</span>
                <div className={cx("info-header__action")}>
                  <div
                    className={cx("info-header__like")}
                    onClick={() => {
                      if (!user) toast.info("Login ????? c?? th??? s??? d???ng!");
                      else {
                        dispatch(addMovieToListLike(movieCurrent.data));
                        toast.info("???? th??m v??o danh s??ch th??ch!");
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    29
                  </div>
                  <div
                    className={cx("info-header__notification")}
                    onClick={() => {
                      if (!user) toast.info("Login ????? c?? th??? s??? d???ng!");
                      else {
                        dispatch(addMovieToListFollow(movieCurrent.data));
                        toast.info("???? ????ng k?? theo d??i phim!");
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faBell} />
                    25
                  </div>
                  <button className={cx("info-header__btn-toff-advert")}>T???t QC</button>
                </div>
              </div>
            </div>
            <div className={cx("info-box__content")}>
              <div className={cx("replace-css")}>
                <Tabs
                  defaultActiveKey="1"
                  items={[
                    {
                      label: `Th??ng tin`,
                      key: "1",
                      children: (
                        <>
                          <div className={cx("info-box-genre")}>
                            Qu???c gia:
                            <Link to="/">
                              {movieCurrent.data &&
                                " " + movieCurrent.data.movie.country.map((element) => element.name + " ")}
                            </Link>
                          </div>
                          <div className={cx("info-box-genre")}>
                            N??m ph??t h??nh: {movieCurrent.data && movieCurrent.data.movie.year}
                          </div>
                          <div className={cx("info-box-genre")}>
                            Ch???t l?????ng: {movieCurrent.data && movieCurrent.data.movie.quality}
                          </div>
                          <div className={cx("info-box-genre")}>
                            ??m thanh: {movieCurrent.data && movieCurrent.data.movie.lang}
                          </div>
                          <div className={cx("info-box-genre")}>
                            C???p nh???t:{" "}
                            {movieCurrent.data &&
                              (movieCurrent.data.movie.episode_current === "Full"
                                ? "Full"
                                : movieCurrent.data.movie.episode_current.split(" ")[1] +
                                  " / " +
                                  movieCurrent.data.movie.episode_total)}
                          </div>
                          <div className={cx("info-box-genre")}>??i???m IMDB: 8.5/10 (261,000 b??nh ch???n)</div>
                          <div className={cx("info-box-genre")}>
                            T??n kh??c: {movieCurrent.data && movieCurrent.data.movie.origin_name}
                          </div>
                          <div className={cx("info-box-genre")}>
                            Th??? lo???i:
                            <Link to="/the-loai/hanh-dong" target="_blank">
                              &nbsp;H??nh ?????ng
                            </Link>
                            ,&nbsp;
                            <Link to="/the-loai/phieu-luu" target="_blank">
                              Phi??u L??u
                            </Link>
                            ,&nbsp;
                            <Link to="/the-loai/vien-tuong" target="_blank">
                              Vi???n T?????ng
                            </Link>
                            ,&nbsp;
                            <Link to="/the-loai/kich-tinh" target="_blank">
                              K???ch T??nh
                            </Link>
                          </div>
                          <div className={cx("info-box__description")}>
                            {movieCurrent.data &&
                              movieCurrent.data.movie.content.slice(3, movieCurrent.data.movie.content.length - 4)}
                          </div>
                          <div className={cx("info-box__tag")}>
                            <span>{movieCurrent.data && movieCurrent.data.movie.name}</span>
                            <span>{movieCurrent.data && movieCurrent.data.movie.origin_name}</span>
                            <span>phim {movieCurrent.data && movieCurrent.data.movie.name}</span>
                            <span>
                              {movieCurrent.data && movieCurrent.data.movie.name} t???p {episode}
                            </span>{" "}
                            <span>
                              <Link to={"/watch/" + name_film + "/" + episode}>
                                {movieCurrent.data && movieCurrent.data.movie.name} ({episode})
                              </Link>
                            </span>
                            <span>{movieCurrent.data && movieCurrent.data.movie.name} m???i nh???t</span>
                            <span>{movieCurrent.data && movieCurrent.data.movie.name} Viet-Engsub</span>
                            <span>{movieCurrent.data && movieCurrent.data.movie.name} FHD</span>
                            <span>Phim1080</span>
                            <span>FimFast</span>
                          </div>
                        </>
                      ),
                    },
                    {
                      label: `Danh s??ch t???p`,
                      key: "2",
                      children: (
                        <>
                          <ul className={cx("list-episode")}>
                            {episodes &&
                              episodes.map((epi, index) => {
                                if (epi.slug !== "full")
                                  return (
                                    <Link
                                      to={"/watch/" + name_film + "/" + (index + 1)}
                                      key={index}
                                      className={cx("list-episode__link")}
                                    >
                                      <li
                                        className={cx("list-episode__item", {
                                          active: index + 1 === parseInt(episode),
                                        })}
                                      >
                                        T???p {index + 1}
                                      </li>
                                    </Link>
                                  );
                                else
                                  return (
                                    <Link
                                      to={"/watch/" + name_film + "/" + epi.slug}
                                      key={index}
                                      className={cx("list-episode__link")}
                                    >
                                      <li className={cx("list-episode__item", "active")}>{epi.name}</li>
                                    </Link>
                                  );
                              })}
                          </ul>
                        </>
                      ),
                    },
                    {
                      label: `B??nh lu???n`,
                      key: "3",
                      children: (
                        <>
                          <div className={cx("comment-box")}>
                            <div className={cx("comment-box__header")}>
                              <img
                                src="	https://lh3.googleusercontent.com/a/ALm5wu1bn5MQF2OS-Ovp1hB3XzxbRwn-o_JtGVs5u3U4=s96-c"
                                alt=""
                                className={cx("comment-box__avatar-user")}
                              />
                              <input type="text" className={cx("comment-box__input")} />
                            </div>
                            <ul className="commment-box__content">
                              <li className={cx("comment-box__item")}>
                                <img
                                  src="https://lh3.googleusercontent.com/a/ALm5wu1bn5MQF2OS-Ovp1hB3XzxbRwn-o_JtGVs5u3U4=s96-c"
                                  alt=""
                                  className={cx("comment-box__avatar-user")}
                                />
                                <div className={cx("comment-box__body")}>
                                  <span className={cx("comment-box__name")}>Ch??u H??n Nguy???n Ng???c</span>
                                  <span className={cx("comment-box-descript")}>
                                    ng?????i ta ra t???p 22 r???i ad ??i, sub t???p 22 l??? ad oi
                                  </span>
                                  <div className={cx("commment-box__action")}>
                                    <div className={cx("comment-box__reply")}>
                                      <FontAwesomeIcon icon={faComment} />
                                      <button className={cx("comment-box__btn")}> tr??? l???i</button>
                                    </div>
                                    <div className={cx("comment-box__time")}>
                                      <FontAwesomeIcon icon={faClock} /> 1 tu???n tr?????c
                                    </div>
                                  </div>
                                </div>
                                <ul className={cx("sub-comment-box")}>
                                  <li className={cx("comment-box__item")}>
                                    <img
                                      src="https://lh3.googleusercontent.com/a/ALm5wu1bn5MQF2OS-Ovp1hB3XzxbRwn-o_JtGVs5u3U4=s96-c"
                                      alt=""
                                      className={cx("comment-box__avatar-user")}
                                    />
                                    <div className={cx("comment-box__body")}>
                                      <span className={cx("comment-box-descript")}>
                                        <span className={cx("comment-box__name")}>Ch??u H??n Nguy???n Ng???c</span>
                                        ng?????i ta ra t???p 22 r???i ad ??i, sub t???p 22 l??? ad oi
                                      </span>
                                      <div className={cx("commment-box__action")}>
                                        <div className={cx("comment-box__reply")}>
                                          <FontAwesomeIcon icon={faComment} />
                                          <button className={cx("comment-box__btn")}> tr??? l???i</button>
                                        </div>
                                        <div className={cx("comment-box__time")}>
                                          <FontAwesomeIcon icon={faClock} /> 1 tu???n tr?????c
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                  {/* <input type="text" className={cx("sub-comment-box__input")} /> */}
                                </ul>
                              </li>
                              <li className={cx("comment-box__item")}>
                                <img
                                  src="https://lh3.googleusercontent.com/a/ALm5wu1bn5MQF2OS-Ovp1hB3XzxbRwn-o_JtGVs5u3U4=s96-c"
                                  alt=""
                                  className={cx("comment-box__avatar-user")}
                                />
                                <div className={cx("comment-box__body")}>
                                  <span className={cx("comment-box__name")}>Ch??u H??n Nguy???n Ng???c</span>
                                  <span className={cx("comment-box-descript")}>
                                    ng?????i ta ra t???p 22 r???i ad ??i, sub t???p 22 l??? ad oi
                                  </span>
                                  <div className={cx("commment-box__action")}>
                                    <div className={cx("comment-box__reply")}>
                                      <FontAwesomeIcon icon={faComment} />
                                      <button className={cx("comment-box__btn")}> tr??? l???i</button>
                                    </div>
                                    <div className={cx("comment-box__time")}>
                                      <FontAwesomeIcon icon={faClock} /> 1 tu???n tr?????c
                                    </div>
                                  </div>
                                </div>
                                <ul className={cx("sub-comment-box")}>
                                  <li className={cx("comment-box__item")}>
                                    <img
                                      src="https://lh3.googleusercontent.com/a/ALm5wu1bn5MQF2OS-Ovp1hB3XzxbRwn-o_JtGVs5u3U4=s96-c"
                                      alt=""
                                      className={cx("comment-box__avatar-user")}
                                    />
                                    <div className={cx("comment-box__body")}>
                                      <span className={cx("comment-box-descript")}>
                                        <span className={cx("comment-box__name")}>Ch??u H??n Nguy???n Ng???c</span>
                                        ng?????i ta ra t???p 22 r???i ad ??i, sub t???p 22 l??? ad oi
                                      </span>
                                      <div className={cx("commment-box__action")}>
                                        <div className={cx("comment-box__reply")}>
                                          <FontAwesomeIcon icon={faComment} />
                                          <button className={cx("comment-box__btn")}> tr??? l???i</button>
                                        </div>
                                        <div className={cx("comment-box__time")}>
                                          <FontAwesomeIcon icon={faClock} /> 1 tu???n tr?????c
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                  {/* <input type="text" className={cx("sub-comment-box__input")} /> */}
                                </ul>
                              </li>
                              <li className={cx("comment-box__item")}>
                                <img
                                  src="https://lh3.googleusercontent.com/a/ALm5wu1bn5MQF2OS-Ovp1hB3XzxbRwn-o_JtGVs5u3U4=s96-c"
                                  alt=""
                                  className={cx("comment-box__avatar-user")}
                                />
                                <div className={cx("comment-box__body")}>
                                  <span className={cx("comment-box__name")}>Ch??u H??n Nguy???n Ng???c</span>
                                  <span className={cx("comment-box-descript")}>
                                    ng?????i ta ra t???p 22 r???i ad ??i, sub t???p 22 l??? ad oi
                                  </span>
                                  <div className={cx("commment-box__action")}>
                                    <div className={cx("comment-box__reply")}>
                                      <FontAwesomeIcon icon={faComment} />
                                      <button className={cx("comment-box__btn")}> tr??? l???i</button>
                                    </div>
                                    <div className={cx("comment-box__time")}>
                                      <FontAwesomeIcon icon={faClock} /> 1 tu???n tr?????c
                                    </div>
                                  </div>
                                </div>
                                <ul className={cx("sub-comment-box")}>
                                  <li className={cx("comment-box__item")}>
                                    <img
                                      src="https://lh3.googleusercontent.com/a/ALm5wu1bn5MQF2OS-Ovp1hB3XzxbRwn-o_JtGVs5u3U4=s96-c"
                                      alt=""
                                      className={cx("comment-box__avatar-user")}
                                    />
                                    <div className={cx("comment-box__body")}>
                                      <span className={cx("comment-box-descript")}>
                                        <span className={cx("comment-box__name")}>Ch??u H??n Nguy???n Ng???c</span>
                                        ng?????i ta ra t???p 22 r???i ad ??i, sub t???p 22 l??? ad oi
                                      </span>
                                      <div className={cx("commment-box__action")}>
                                        <div className={cx("comment-box__reply")}>
                                          <FontAwesomeIcon icon={faComment} />
                                          <button className={cx("comment-box__btn")}> tr??? l???i</button>
                                        </div>
                                        <div className={cx("comment-box__time")}>
                                          <FontAwesomeIcon icon={faClock} /> 1 tu???n tr?????c
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                  {/* <input type="text" className={cx("sub-comment-box__input")} /> */}
                                </ul>
                              </li>
                              <li className={cx("comment-box__item")}>
                                <img
                                  src="https://lh3.googleusercontent.com/a/ALm5wu1bn5MQF2OS-Ovp1hB3XzxbRwn-o_JtGVs5u3U4=s96-c"
                                  alt=""
                                  className={cx("comment-box__avatar-user")}
                                />
                                <div className={cx("comment-box__body")}>
                                  <span className={cx("comment-box__name")}>Ch??u H??n Nguy???n Ng???c</span>
                                  <span className={cx("comment-box-descript")}>
                                    ng?????i ta ra t???p 22 r???i ad ??i, sub t???p 22 l??? ad oi
                                  </span>
                                  <div className={cx("commment-box__action")}>
                                    <div className={cx("comment-box__reply")}>
                                      <FontAwesomeIcon icon={faComment} />
                                      <button className={cx("comment-box__btn")}> tr??? l???i</button>
                                    </div>
                                    <div className={cx("comment-box__time")}>
                                      <FontAwesomeIcon icon={faClock} /> 1 tu???n tr?????c
                                    </div>
                                  </div>
                                </div>
                                <ul className={cx("sub-comment-box")}>
                                  <li className={cx("comment-box__item")}>
                                    <img
                                      src="https://lh3.googleusercontent.com/a/ALm5wu1bn5MQF2OS-Ovp1hB3XzxbRwn-o_JtGVs5u3U4=s96-c"
                                      alt=""
                                      className={cx("comment-box__avatar-user")}
                                    />
                                    <div className={cx("comment-box__body")}>
                                      <span className={cx("comment-box-descript")}>
                                        <span className={cx("comment-box__name")}>Ch??u H??n Nguy???n Ng???c</span>
                                        ng?????i ta ra t???p 22 r???i ad ??i, sub t???p 22 l??? ad oi
                                      </span>
                                      <div className={cx("commment-box__action")}>
                                        <div className={cx("comment-box__reply")}>
                                          <FontAwesomeIcon icon={faComment} />
                                          <button className={cx("comment-box__btn")}> tr??? l???i</button>
                                        </div>
                                        <div className={cx("comment-box__time")}>
                                          <FontAwesomeIcon icon={faClock} /> 1 tu???n tr?????c
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                  {/* <input type="text" className={cx("sub-comment-box__input")} /> */}
                                </ul>
                              </li>
                            </ul>
                          </div>
                        </>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </div>
          <div className="clear"></div>
          <div className={cx("wrap_recom")}>
            <div style={{ margin: "0 -20px" }}>
              <MoviesRecommend showTitleRight moviesRecommend={moviesRecommend} />
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default WatchMovie;
