<?php

namespace Drupal\eguide\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Access\AccessResult;

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

}
