<?php

namespace Drupal\eguide\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Access\AccessResult;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class apiController.
 */
class apiController extends ControllerBase {

  /**
   * Check user auth.
   */
  public function user_auth() {
    $uid = \Drupal::currentUser()->id();

    if ($uid == 0) {
      return AccessResult::forbidden();
    }
    else {
      return AccessResult::allowed();
    }
  }

  /**
   * save data.
   */
  public function eguide_save_data(Request $post) {
    $response = array();

    if (strpos($post->headers->get('Content-Type'), 'application/json') === 0) {
      $data = json_decode($post->getContent(), TRUE);

      $password = $post->headers->get('password');

      $uid = $data['uid'];
      $username = $data['username'];

      if ($password == 'ZoqH1lhVpN3hPlo5Bwy0uqxqjiCVZet6') {
        $values = [
          'type' => 'eguide_access',
          'uid' => 1,
          'title' => $data['username'] . "-" . \Drupal::time()->getRequestTime(),
          'field_user_id' => ['target_id' => $uid],
        ];

        $node = Node::create($values);
        $node->save();

        $response = ['status' => 'success'];
      }
      else {
        $response = ['status' => 'failed'];
      }
  }

}
